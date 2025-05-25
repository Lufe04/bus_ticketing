import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection, addDoc, getDocs, query, where, orderBy, Timestamp, getDoc, doc, getFirestore
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
  asientosDisponibles?: number; // Añadido para permitir el campo calculado
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
  searchBoardings: (from: string, to: string, date: Date) => Promise<Boarding[]>;
  getBoardings: () => Promise<void>;
  addBoarding: (data: Omit<Boarding, 'id'>) => Promise<void>;
  getCurrentBoarding: () => Boarding | null;
  clearError: () => void;
  getCompletedBoardingsGrouped: (month?: number, year?: number) => Record<string, RouteEntry[]>;
  selectedPassenger: Passenger | null; // ✅ NUEVO
  setSelectedPassenger: (passenger: Passenger | null) => void;
  refreshBoarding: () => Promise<void>; // Añadido para refrescar el boarding actual
  getActiveBoarding: () => Boarding | null; // Añadido para obtener el boarding activo
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
  const MAX_ASIENTOS_POR_BUS = 20;

  const { userData } = useUser();

// Para el archivo BoardingContext.tsx
const searchBoardings = async (from: string, to: string, date: Date): Promise<Boarding[]> => {
  setLoading(true);
  try {
    // SOLUCIÓN: Limpiar espacios en blanco al inicio y final
    const cleanFrom = from.trim();
    const cleanTo = to.trim();
    
    console.log(`🔍 Buscando viajes de ${cleanFrom} a ${cleanTo} el ${date.toLocaleDateString()}`);
    
    // Obtener todos los boardings
    const boardingRef = collection(db, 'boarding');
    const snapshot = await getDocs(boardingRef);
    
    const results: Boarding[] = [];
    
    // Normalizar la fecha de búsqueda para comparación (solo fecha, sin tiempo)
    const searchDateStr = date.toDateString();
    
    for (const doc of snapshot.docs) {
      const data = doc.data() as Boarding;
      
      // Convertir Timestamp a Date si es necesario
      const startTime = data.hora_inicio?.toDate ? 
                        data.hora_inicio.toDate() : 
                        data.hora_inicio.toDate();
      
      // Comparar solo la fecha (sin tiempo)
      const tripDateStr = startTime.toDateString();
      
      // COINCIDENCIA EXACTA - con datos limpios
      const fromMatches = data.desde.trim() === cleanFrom;
      const toMatches = data.hasta.trim() === cleanTo;
      
      console.log(`🔍 Comparando: BD(${data.desde.trim()} → ${data.hasta.trim()}) vs Búsqueda(${cleanFrom} → ${cleanTo})`);
      console.log(`📅 Fecha BD: ${tripDateStr} vs Búsqueda: ${searchDateStr}`);
      
      // Verificar si coinciden los criterios básicos
      if (
        tripDateStr === searchDateStr &&
        fromMatches &&
        toMatches &&
        data.estado !== 'finalizado'
      ) {
        // NUEVO: Obtener la lista de pasajeros para calcular asientos disponibles
        const pasajerosSnapshot = await getDocs(collection(doc.ref, 'pasajeros'));
        const pasajeros_lista: Passenger[] = pasajerosSnapshot.docs.map(docPasajero => docPasajero.data() as Passenger);
        
        // Calcular asientos disponibles
        const pasajerosActuales = pasajeros_lista.length;
        const asientosDisponibles = MAX_ASIENTOS_POR_BUS - pasajerosActuales;
        
        console.log(`📊 Viaje encontrado: ${data.desde} → ${data.hasta}`);
        console.log(`👥 Pasajeros actuales: ${pasajerosActuales}/${MAX_ASIENTOS_POR_BUS}`);
        console.log(`💺 Asientos disponibles: ${asientosDisponibles}`);
        
        // Solo incluir si hay asientos disponibles
        if (asientosDisponibles > 0) {
          // También obtener historial de paradas
          const historialSnapshot = await getDocs(collection(doc.ref, 'historial_paradas'));
          const historial: BoardingHistory[] = historialSnapshot.docs.map(docHistorial => docHistorial.data() as BoardingHistory);
          
          results.push({
            id: doc.id,
            ...data,
            pasajeros: MAX_ASIENTOS_POR_BUS, // Actualizar con el máximo real
            asientosDisponibles: asientosDisponibles, // Añadir campo calculado
            historial_paradas: historial,
            pasajeros_lista: pasajeros_lista,
          });
        } else {
          console.log(`❌ Viaje completo (sin asientos disponibles)`);
        }
      }
    }
    
    // Ordenar por hora de inicio
    results.sort((a, b) => {
      const timeA = a.hora_inicio && typeof a.hora_inicio.toDate === 'function'
        ? a.hora_inicio.toDate()
        : new Date(a.hora_inicio as unknown as string);
      const timeB = b.hora_inicio && typeof b.hora_inicio.toDate === 'function'
        ? b.hora_inicio.toDate()
        : new Date(b.hora_inicio as unknown as string);
      return timeA.getTime() - timeB.getTime();
    });
    
    console.log(`✅ Se encontraron ${results.length} viajes con asientos disponibles`);
    return results;
  } catch (err) {
    console.error('❌ Error buscando viajes:', err);
    setError('Error al buscar viajes disponibles');
    return [];
  } finally {
    setLoading(false);
  }
};

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
        getActiveBoarding, 
        searchBoardings,
      }}
    >
      {children}
    </BoardingContext.Provider>
  );
}
