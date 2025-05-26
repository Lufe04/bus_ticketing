import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, Timestamp, getDoc, doc, getFirestore,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';
import { useUser } from './UserContext';

// Tipos
export interface BoardingHistory {
  nombre: string;
  hora_llegada: Timestamp;
  orden: number;
}

export interface Passenger {
  escaneado: boolean;
  nombre: string;
  puesto: number;
  idUsuario: string;
  pushToken?: string;
}

export interface Boarding {
  id?: string;
  desde: string;
  hasta: string;
  paradas: string[];
  duracion_estimada: string;
  pasajeros: number;
  parada_actual: string;
  hora_llegada: Timestamp;
  hora_inicio: Timestamp;
  hora_fin: Timestamp;
  conductor: string;
  estado: 'programado' | 'en_curso' | 'finalizado';
  historial_paradas?: BoardingHistory[];
  pasajeros_lista?: Passenger[];
}

type RouteEntry = {
  from: string;
  to: string;
  duration: string;
  status: 'completado' | 'no_realizado' | 'en_curso';
};

// Interfaz del contexto
interface BoardingContextType {
  boardings: Boarding[];
  loading: boolean;
  error: string | null;
  getBoardings: () => Promise<void>;
  addBoarding: (data: Omit<Boarding, 'id'>) => Promise<void>;
  getCurrentBoarding: () => Boarding | null;
  clearError: () => void;
  getCompletedBoardingsGrouped: (month?: number, year?: number) => Record<string, RouteEntry[]>;
  selectedPassenger: Passenger | null; // ✅ NUEVO
  setSelectedPassenger: (passenger: Passenger | null) => void;
  refreshBoarding: () => Promise<void>; // Añadido para refrescar el boarding actual
  getActiveBoarding: () => Boarding | null; // Añadido para obtener el boarding activo
  isBoardingLoading: boolean; // ✅ NUEVO
}

// Crear contexto
const BoardingContext = createContext<BoardingContextType | undefined>(undefined);

// Hook
export function useBoarding() {
  const context = useContext(BoardingContext);
  if (!context) throw new Error('useBoarding must be used within a BoardingProvider');
  return context;
}

// Provider
export function BoardingProvider({ children }: { children: ReactNode }) {
  const [boardings, setBoardings] = useState<Boarding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [isBoardingLoading, setIsBoardingLoading] = useState(true);

  const { userData } = useUser();

  const getBoardings = async () => {
    setLoading(true);
    try {
      console.log('🚀 Ejecutando getBoardings con userId:', userData?.id); 
      if (!userData?.id) {
        console.warn('⚠️ No hay ID del usuario');
        setBoardings([]);
        return;
      }

      const q = query(
        collection(db, 'boarding'), 
        where('conductor', '==', userData.id),
        orderBy('hora_inicio', 'asc')
      );

      const snapshot = await getDocs(q);

      const data: Boarding[] = [];

      for (const docSnap of snapshot.docs) {
  const boardingData = docSnap.data();

  const [historialSnapshot, pasajerosSnapshot] = await Promise.all([
      getDocs(collection(docSnap.ref, 'historial_paradas')),
      getDocs(collection(docSnap.ref, 'pasajeros')),
    ]);

    const historial: BoardingHistory[] = historialSnapshot.docs.map(doc => doc.data() as BoardingHistory);
    const pasajeros_lista: Passenger[] = pasajerosSnapshot.docs.map(doc => doc.data() as Passenger);

    data.push({
      id: docSnap.id,
      ...boardingData,
      historial_paradas: historial,
      pasajeros_lista,
    } as Boarding);
  }
      setBoardings(data);
    } catch (err) {
      console.error('Error fetching boardings:', err);
      setError('Error al cargar registros de abordaje');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBoarding = (): Boarding | null => {
    const now = Timestamp.now();

    const upcoming = boardings
      .filter(b => b.estado === 'programado' && b.hora_inicio?.seconds > now.seconds)
      .sort((a, b) => a.hora_inicio.seconds - b.hora_inicio.seconds);

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const getActiveBoarding = (): Boarding | null => {
    return boardings.find(b => b.estado === 'en_curso') || null;
  };


  const refreshBoarding = async () => {
    const current = getCurrentBoarding();
    if (!current?.id) return;
    const ref = doc(db, 'boarding', current.id);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const updated = snapshot.data();
      setBoardings((prev) =>
        prev.map((b) =>
          b.id === current.id ? { ...b, ...updated } as Boarding : b
        )
      );
    }
  };


  const addBoarding = async (data: Omit<Boarding, 'id'>) => {
    try {
      await addDoc(collection(db, 'boardings'), data);
      getBoardings();
    } catch (err) {
      console.error('Error adding boarding:', err);
      setError('Error al agregar abordaje');
    }
  };

  const getCompletedBoardingsGrouped = (
    month?: number,
    year?: number
  ): Record<string, RouteEntry[]> => {
    const grouped: Record<string, RouteEntry[]> = {};
    const now = new Date();

    boardings
      .filter((b) => {
        const date = b.hora_inicio.toDate();
        return (
          (!month || date.getMonth() + 1 === month) &&
          (!year || date.getFullYear() === year)
        );
      })
      .forEach((b) => {
        const dateObj = b.hora_inicio.toDate();
        const dateKey = dateObj.toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const horaInicio = b.hora_inicio.toDate();
        const horaFin = b.hora_fin.toDate();

        // Calcular duración
        const durationMs = horaFin.getTime() - horaInicio.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        const durationString =
          minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;

        // Determinar estado
        let status: RouteEntry['status'];
        if (b.estado === 'finalizado') {
          status = 'completado';
        } else if (b.estado === 'en_curso') {
          status = 'en_curso';
        } else if (b.estado === 'programado' && horaFin < now) {
          status = 'no_realizado';
        } else {
          return; // Excluir viajes programados futuros
        }

        if (!grouped[dateKey]) grouped[dateKey] = [];

        grouped[dateKey].push({
          from: b.desde,
          to: b.hasta,
          duration: durationString,
          status,
        });
      });

    return grouped;
  };

  const clearError = () => setError(null);

  useEffect(() => {
    console.log('🧑 userData al cargar boardings:', userData); // 👈 AGREGA ESTA LÍNEA
    if (userData?.id) {
      getBoardings();
    }
  }, [userData?.id]);

  useEffect(() => {
    if (!userData?.id) return;

    const q = query(
      collection(db, 'boarding'),
      where('conductor', '==', userData.id),
      orderBy('hora_inicio', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data: Boarding[] = [];

      for (const docSnap of snapshot.docs) {
        const boardingData = docSnap.data();

        const [historialSnapshot, pasajerosSnapshot] = await Promise.all([
          getDocs(collection(docSnap.ref, 'historial_paradas')),
          getDocs(collection(docSnap.ref, 'pasajeros')),
        ]);

        const historial: BoardingHistory[] = historialSnapshot.docs.map(doc => doc.data() as BoardingHistory);
        const pasajeros_lista: Passenger[] = pasajerosSnapshot.docs.map(doc => doc.data() as Passenger);

        data.push({
          id: docSnap.id,
          ...boardingData,
          historial_paradas: historial,
          pasajeros_lista,
        } as Boarding);
      }

      setBoardings(data);
      setIsBoardingLoading(false); // ✅ Marca fin de carga
    });

    return () => unsubscribe();
  }, [userData?.id]);


  return (
    <BoardingContext.Provider
      value={{
        boardings,
        loading,
        error,
        getBoardings,
        addBoarding,
        getCurrentBoarding,
        clearError,
        getCompletedBoardingsGrouped,
        selectedPassenger, // ✅ NUEVO
        setSelectedPassenger,
        refreshBoarding, // Añadido para refrescar el boarding actual
        getActiveBoarding, // Añadido para obtener el boarding activo
        isBoardingLoading, // ✅ NUEVO
      }}
    >
      {children}
    </BoardingContext.Provider>
  );
}
