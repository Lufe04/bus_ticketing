import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/FirebaseConfig';

// Definir tipos para los datos de registro
export interface RegisterUserData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role?: 'client' | 'driver';
  documento?: string;
  telefono?: string;
}

// Definir tipo para datos de usuario
export interface UserData {
  uid?: string;
  nombre: string;
  apellido: string;
  email: string;
  role?: 'client' | 'driver';
  documento?: string;
  telefono?: string;
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  // Estado de autenticación
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Funciones de autenticación básicas
  login: (email: string, password: string) => Promise<FirebaseUser | null>;
  loginWithProfile: (email: string, password: string) => Promise<{user: FirebaseUser, userData: UserData | null}>;
  register: (email: string, password: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Función para registro completo (Auth + UserData)
  registerWithProfile: (
    userData: RegisterUserData,
    createUserInFirestore: (userId: string) => Promise<void>
  ) => Promise<FirebaseUser | null>;
  
  // Funciones para verificación de roles
  isClient: () => boolean;
  isDriver: () => boolean;
  getInitialRoute: () => string;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del usuario desde Firestore
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { uid: userId, ...userDoc.data() } as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  };

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Si hay un usuario autenticado, obtener sus datos
      if (user) {
        try {
          const data = await fetchUserData(user.uid);
          setUserData(data);
        } catch (error) {
          console.error('Error al cargar datos de usuario:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Iniciar sesión
  const login = async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Obtener datos del usuario
      const user = userCredential.user;
      const data = await fetchUserData(user.uid);
      setUserData(data);
      
      return user;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      throw error;
    }
  };

  // Iniciar sesión y devolver también los datos del perfil
  const loginWithProfile = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Obtener datos del usuario
      const data = await fetchUserData(user.uid);
      setUserData(data);
      
      return { user, userData: data };
    } catch (error) {
      console.error('Error de inicio de sesión con perfil:', error);
      throw error;
    }
  };

  // Registrar nuevo usuario (solo autenticación)
  const register = async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error de registro:', error);
      throw error;
    }
  };

  // Función mejorada para registro completo
  // Acepta una función callback que se encargará de crear el usuario en Firestore
  const registerWithProfile = async (
    userData: RegisterUserData,
    createUserInFirestore: (userId: string) => Promise<void>
  ): Promise<FirebaseUser | null> => {
    try {
      // 1. Registrar en Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // 2. Crear perfil en Firestore usando el callback
      try {
        await createUserInFirestore(user.uid);
        
        // Actualizar el estado con los datos del usuario
        setUserData({
          uid: user.uid,
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          role: userData.role,
          documento: userData.documento,
          telefono: userData.telefono
        });
        
        console.log('Usuario registrado completamente en Auth y Firestore');
      } catch (firestoreError) {
        console.error('Error al crear perfil en Firestore:', firestoreError);
        
        // Si falla la creación en Firestore, eliminamos el usuario de Auth
        // para mantener consistencia (evitar usuarios huérfanos)
        try {
          await user.delete();
          console.warn('Usuario eliminado de Auth debido a error en Firestore');
          throw new Error('No se pudo completar el registro. Error al guardar datos de usuario.');
        } catch (deleteError) {
          console.error('Error al eliminar usuario de Auth:', deleteError);
          throw new Error('Error crítico en registro. Contacte al administrador.');
        }
      }
      
      return user;
    } catch (error) {
      console.error('Error en registro completo:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw error;
    }
  };

  // Funciones para verificar roles
  const isClient = () => userData?.role === 'client';
  const isDriver = () => userData?.role === 'driver';
  
  // Función para obtener la ruta inicial según el rol
  const getInitialRoute = () => {
    if (!userData || !userData.role) return '/login';
    
    switch(userData.role) {
      case 'client':
        return '/client';
      case 'driver':
        return '/driver';
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAuthenticated: !!currentUser,
    login,
    loginWithProfile,
    register,
    registerWithProfile,
    logout,
    resetPassword,
    isClient,
    isDriver,
    getInitialRoute
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;