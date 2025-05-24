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

// Interfaz para el contexto de autenticación
interface AuthContextType {
  // Estado de autenticación
  currentUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
   userData: any;
  
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
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null)

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dataWithId = { id: docSnap.id, ...docSnap.data() };
          setUserData(dataWithId);
          console.log('✅ Documento de usuario encontrado:', dataWithId);
        } else {
          console.warn('⚠️ No se encontró el documento del usuario en Firestore');
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);


  const loginWithProfile = async (email: string, password: string): Promise<any> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const dataWithId = { ...data, id: user.uid }; // ✅ agrega el id
        setUserData(dataWithId); // ✅ ahora sí estará disponible en todo el contexto
        return dataWithId;
      } else {
        throw new Error('No se encontró el perfil del usuario');
      }
    } catch (error) {
      console.error('Error en loginWithProfile:', error);
      throw error;
    }
  };


  // Iniciar sesión
  const login = async (email: string, password: string): Promise<FirebaseUser | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
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
    userData,
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