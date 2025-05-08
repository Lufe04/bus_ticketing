import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';
import { useAuth } from './AuthContext';

// Definir roles de usuario directamente para evitar dependencias circulares
export type UserRole = 'client' | 'driver' | 'handler' | 'admin';

// Interfaz para el usuario en Firestore
export interface UserData {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  role: UserRole;
  saldo?: number;
  documento?: string; // Documento de identidad único
  telefono?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
}

// Interfaz para el contexto de usuario
interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  createUser: (userId: string, userData: UserData) => Promise<void>;
  updateUserData: (userId: string, userData: Partial<UserData>) => Promise<void>;
  getUserById: (id: string) => Promise<UserData | null>;
  getUserByEmail: (email: string) => Promise<UserData | null>;
  getUsersByRole: (role: UserRole) => Promise<UserData[]>;
  getUserByDocumento: (documento: string) => Promise<UserData | null>;
  deleteUserData: (userId: string) => Promise<void>;
  updateUserBalance: (userId: string, amount: number) => Promise<void>;
  refreshUserData: () => Promise<void>; // Nueva función para actualizar datos manualmente
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Función para cargar datos del usuario que podemos llamar desde varios lugares
  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log(`Intentando cargar datos del usuario: ${userId}`);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Documento de usuario encontrado:", data.nombre);
        
        // Actualizar último acceso
        try {
          await updateDoc(doc(db, 'users', userId), {
            ultimoAcceso: new Date().toISOString()
          });
        } catch (updateError) {
          console.warn("No se pudo actualizar último acceso:", updateError);
          // Continuamos a pesar del error
        }
        
        setUserData({ 
          id: userDoc.id, 
          ...data as Omit<UserData, 'id'> 
        });
        return true;
      } else {
        console.warn(`No existe documento en Firestore para el usuario: ${userId}`);
        setUserData(null);
        setLoadError("No se encontró información del usuario en la base de datos");
        return false;
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
      setUserData(null);
      setLoadError("Error al cargar datos del usuario");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar datos manualmente
  const refreshUserData = async (): Promise<void> => {
    if (currentUser) {
      await loadUserData(currentUser.uid);
    }
  };

  // Cargar datos del usuario cuando cambie currentUser
  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.uid);
    } else {
      setUserData(null);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Obtener usuario por ID
  const getUserById = async (id: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  };

  // Obtener usuario por documento
  const getUserByDocumento = async (documento: string): Promise<UserData | null> => {
    try {
      const q = query(collection(db, 'users'), where('documento', '==', documento));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por documento:', error);
      throw error;
    }
  };

  // Obtener usuario por correo
  const getUserByEmail = async (email: string): Promise<UserData | null> => {
    try {
      const q = query(collection(db, 'users'), where('correo', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por correo:', error);
      throw error;
    }
  };

  // Crear un nuevo usuario en Firestore
  const createUser = async (userId: string, userData: UserData) => {
    try {
      console.log(`Intentando crear usuario: ${userId}`, userData);
      
      // Verificar que el documento no exista ya
      if (userData.documento) {
        const existingUser = await getUserByDocumento(userData.documento);
        if (existingUser) {
          throw new Error(`Ya existe un usuario con el documento ${userData.documento}`);
        }
      }
      
      // Verificar si ya existe correo
      if (userData.correo) {
        const existingUser = await getUserByEmail(userData.correo);
        if (existingUser) {
          throw new Error(`Ya existe un usuario con el correo ${userData.correo}`);
        }
      }
      
      // Agregar campos automáticos
      const userToCreate = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        correo: userData.correo,
        role: userData.role || 'client', // Valor por defecto
        saldo: userData.saldo || 0,
        documento: userData.documento || '',
        telefono: userData.telefono || '',
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: new Date().toISOString()
      };
      
      // Usar set con merge:true para no sobrescribir datos existentes
      await setDoc(doc(db, 'users', userId), userToCreate, { merge: true });
      
      console.log(`Usuario creado con éxito: ${userId}`);
      
      // Si estamos creando al usuario actual, actualizar el estado
      if (currentUser && currentUser.uid === userId) {
        setUserData({ id: userId, ...userToCreate });
      }
      
      return;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  };

  // Actualizar datos del usuario
  const updateUserData = async (userId: string, userData: Partial<UserData>): Promise<void> => {
    try {
      console.log(`Actualizando datos del usuario: ${userId}`, userData);
      await updateDoc(doc(db, 'users', userId), userData);
      if (currentUser && currentUser.uid === userId) {
        setUserData((prev) => (prev ? { ...prev, ...userData } : null));
      }
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  };
  
  // Eliminar datos de usuario
  const deleteUserData = async (userId: string): Promise<void> => {
    try {
      console.log(`Eliminando usuario: ${userId}`);
      await deleteDoc(doc(db, 'users', userId));
      if (currentUser && currentUser.uid === userId) {
        setUserData(null);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  };

  // Actualizar saldo de usuario
  const updateUserBalance = async (userId: string, amount: number): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.saldo || 0;
      const newBalance = currentBalance + amount;
      
      // No permitir saldos negativos (solo para retiros)
      if (amount < 0 && newBalance < 0) {
        throw new Error('Saldo insuficiente');
      }
      
      console.log(`Actualizando saldo de ${userId}: ${currentBalance} -> ${newBalance}`);
      
      // Actualizar saldo en Firestore
      await updateDoc(doc(db, 'users', userId), { 
        saldo: newBalance,
        ultimaActualizacionSaldo: new Date().toISOString()
      });
      
      // Si estamos actualizando al usuario actual, actualizar el estado
      if (currentUser && currentUser.uid === userId) {
        setUserData((prev) => prev ? { ...prev, saldo: newBalance } : null);
      }
    } catch (error) {
      console.error('Error al actualizar saldo del usuario:', error);
      throw error;
    }
  };

  // Obtener usuarios por rol
  const getUsersByRole = async (role: UserRole): Promise<UserData[]> => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw error;
    }
  };
  
  const value = {
    userData,
    isLoading,
    createUser,
    updateUserData,
    getUserById,
    getUserByEmail,
    getUserByDocumento,
    getUsersByRole,
    deleteUserData,
    updateUserBalance,
    refreshUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;