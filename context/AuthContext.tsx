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
import { auth, db  } from '../utils/FirebaseConfig';

// Definir tipos para los datos de registro
export interface RegisterUserData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  role?: 'client' | 'driver' | 'handler' | 'admin';
  documento?: string;
  telefono?: string;
}

// Definir tipo para userData
export interface UserData {
  nombre: string;
  apellido: string;
  email: string;
  role?: 'client' | 'driver' | 'handler' | 'admin';
  documento?: string;
  telefono?: string;
  // Otros campos que pueda tener tu objeto userData
}

// Interfaz para el contexto de autenticación
interface AuthContextType {
  // Estado de autenticación
  currentUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  userData: UserData | null; // Añadida esta propiedad
  
  // Funciones de autenticación básicas
  login: (email: string, password: string) => Promise<FirebaseUser | null>;
  loginWithProfile: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Función para registro completo (Auth + UserData)
  registerWithProfile: (
    userData: RegisterUserData,
    createUserInFirestore: (userId: string) => Promise<void>
  ) => Promise<FirebaseUser | null>;
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
  const [userData, setUserData] = useState<UserData | null>(null); // Añadido estado para userData
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null)

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // Aquí podrías cargar los datos del usuario desde Firestore
      if (user) {
        // Ejemplo de cómo podrías cargar los datos del usuario 
        // (deberías implementar fetchUserData según tu estructura)
        fetchUserData(user.uid)
          .then(data => setUserData(data))
          .catch(error => console.error('Error al cargar datos de usuario:', error));
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

  // Función para cargar datos del usuario (debes implementarla)
  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    // Implementa esta función según tu estructura de datos
    // Por ejemplo, obteniendo los datos desde Firestore
    try {
      // Ejemplo: const userDoc = await getDoc(doc(firestore, 'users', userId));
      // return userDoc.exists() ? userDoc.data() as UserData : null;
      
      // Retornar datos de ejemplo (reemplaza esto con tu implementación real)
      return {
        nombre: 'Usuario',
        apellido: 'Ejemplo',
        email: 'usuario@ejemplo.com'
      };
    } catch (error) {
      console.error('Error al obtener datos de usuario:', error);
      return null;
    }
  };

  // Iniciar sesión
  const login = async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Cargar datos del usuario al iniciar sesión
      const user = userCredential.user;
      const data = await fetchUserData(user.uid);
      setUserData(data);
      
      return user;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
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
        
        // Guardar datos del usuario en el estado
        setUserData({
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
      setUserData(null); // Limpiar datos del usuario al cerrar sesión
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

  const value = {
    currentUser,
    userData, // Incluir userData en el valor del contexto
    loading,
    isAuthenticated: !!currentUser,
    login,
    loginWithProfile,
    register,
    registerWithProfile,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;