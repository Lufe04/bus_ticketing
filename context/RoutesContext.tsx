import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp, DocumentData, DocumentReference, QuerySnapshot } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';
import { useUser } from './UserContext';

// Define the structure for a route
export interface ClientRoute {
  id?: string;
  cantidad: string;
  desde: string;
  hasta: string;
  fecha_regreso: string;
  fecha_salida: string;
  usuario: string;
  createdAt?: string;
  asiento: string;
  estado?: 'activo' | 'inactivo';
  hora?: string;
  boarding_id?: string;
  viaje_id?: string; // ID específico del viaje 
  escaneado?: boolean;
}

// Interface for the context
interface RoutesContextType {
  routes: ClientRoute[];
  userRoutes: ClientRoute[];
  loading: boolean;
  error: string | null;
  addRoute: (route: Omit<ClientRoute, 'id'>) => Promise<ClientRoute | null>;
  updateRoute: (id: string, updatedData: Partial<ClientRoute>) => Promise<boolean>;
  deleteRoute: (id: string) => Promise<boolean>;
  getUserRoutes: () => Promise<void>;
  getRoutes: () => Promise<void>;
  clearError: () => void;
  marcarComoEscaneado: (id: string) => Promise<boolean>; // Nueva función para marcar como escaneado
}

// Create the context
const RoutesContext = createContext<RoutesContextType | undefined>(undefined);

// Provider component
export function RoutesProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<ClientRoute[]>([]);
  const [userRoutes, setUserRoutes] = useState<ClientRoute[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { userData } = useUser();

  // Determinar si una ruta está activa basada en la fecha y estado de escaneado
  const determinarEstadoRuta = (fechaSalida: string, escaneado: boolean = false): 'activo' | 'inactivo' => {
    // Si ya ha sido escaneado, el estado es inactivo automáticamente
    if (escaneado) return 'inactivo';
    
    try {
      // Intentar convertir la fecha del formato almacenado "10 May 2025" a objeto Date
      const dateParts = fechaSalida.split(' ');
      if (dateParts.length < 3) return 'inactivo'; // Formato inválido
      
      const day = parseInt(dateParts[0]);
      const monthMap: {[key: string]: number} = {
        'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
      };
      const month = monthMap[dateParts[1].toLowerCase()];
      if (month === undefined) return 'inactivo'; // Mes no reconocido
      
      const year = parseInt(dateParts[2]);
      
      const ticketDate = new Date(year, month, day);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Normalizar a inicio del día
      
      return ticketDate >= currentDate ? 'activo' : 'inactivo';
    } catch (e) {
      console.error('Error determinando estado de la ruta:', e);
      return 'inactivo'; // Por defecto inactivo en caso de error
    }
  };

  // Get all routes
  const getRoutes = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'client_routes'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const routesData: ClientRoute[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const escaneado = data.escaneado || false;
        const estado = escaneado ? 'inactivo' : determinarEstadoRuta(data.fecha_salida || '');
        
        routesData.push({
          id: doc.id,
          cantidad: data.cantidad || '',
          desde: data.desde || '',
          hasta: data.hasta || '',
          fecha_regreso: data.fecha_regreso || '',
          fecha_salida: data.fecha_salida || '',
          usuario: data.usuario || '',
          createdAt: data.createdAt || '',
          asiento: data.asiento || '',
          estado: data.estado || estado,
          hora: data.hora || '',
          boarding_id: data.boarding_id || '',
          viaje_id: data.viaje_id || '',
          escaneado: escaneado
        });
      });
      
      setRoutes(routesData);
    } catch (err) {
      console.error('Error getting routes:', err);
      setError('Error al obtener las rutas');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get routes for the current user
  // Función modificada que solo filtra sin ordenar
const getUserRoutes = useCallback(async (): Promise<void> => {
  if (!userData?.id) {
    setUserRoutes([]);
    return;
  }

  setLoading(true);
  try {
    // Solo usamos el filtro "where" sin el "orderBy"
    const q = query(
      collection(db, 'client_routes'),
      where('usuario', '==', userData.id)
      // Ya no usamos orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const routesData: ClientRoute[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const escaneado = data.escaneado || false;
      const estado = escaneado ? 'inactivo' : determinarEstadoRuta(data.fecha_salida || '');
      
      routesData.push({
        id: doc.id,
        cantidad: data.cantidad || '',
        desde: data.desde || '',
        hasta: data.hasta || '',
        fecha_regreso: data.fecha_regreso || '',
        fecha_salida: data.fecha_salida || '',
        usuario: data.usuario || '',
        createdAt: data.createdAt || '',
        asiento: data.asiento || '',
        estado: data.estado || estado,
        hora: data.hora || '',
        boarding_id: data.boarding_id || '',
        viaje_id: data.viaje_id || '',
        escaneado: escaneado
      });
    });
    
    // Si quieres mantener algún tipo de orden, puedes ordenar los datos en memoria
    // pero esto es opcional y no afecta a Firestore
    /* 
    routesData.sort((a, b) => {
      // Ordenar por algún criterio si lo deseas
      return 0;
    });
    */
    
    setUserRoutes(routesData);
  } catch (err) {
    console.error('Error getting user routes:', err);
    setError('Error al obtener tus rutas');
  } finally {
    setLoading(false);
  }
}, [userData?.id]);

  // Add a new route
  const addRoute = async (route: Omit<ClientRoute, 'id'>): Promise<ClientRoute | null> => {
    setLoading(true);
    try {
      console.log("RoutesContext: Añadiendo ruta:", route);
      
      // Por defecto, un ticket nuevo no está escaneado
      const escaneado = route.escaneado !== undefined ? route.escaneado : false;
      
      // Determinar el estado basado en la fecha y si está escaneado
      const estado = escaneado ? 'inactivo' : (route.estado || determinarEstadoRuta(route.fecha_salida));
      
      // Generar un viaje_id si no se proporciona
      const viaje_id = route.viaje_id || `V-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Verificar que la colección sea la correcta
      const routesCollection = collection(db, 'client_routes');
      
      // Asegurarse de que todos los campos estén presentes
      const routeData = {
        ...route,
        estado,
        escaneado,
        viaje_id,
        createdAt: route.createdAt || new Date().toISOString()
      };
      
      // Añadir documento a Firestore
      const docRef = await addDoc(routesCollection, routeData);
      
      console.log("RoutesContext: Documento añadido con ID:", docRef.id);
      
      // Actualizar estado local
      const newRoute = {
        id: docRef.id,
        ...routeData
      };
      
      setRoutes(prevRoutes => [...prevRoutes, newRoute]);
      setUserRoutes(prevUserRoutes => [...prevUserRoutes, newRoute]);
      
      // Retornar la ruta con ID
      return newRoute;
    } catch (err) {
      console.error("RoutesContext: Error añadiendo ruta:", err);
      setError('Error al guardar la ruta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing route
  const updateRoute = async (id: string, updatedData: Partial<ClientRoute>): Promise<boolean> => {
    setLoading(true);
    try {
      // Si se cambia escaneado a true, cambiar el estado a inactivo
      if (updatedData.escaneado === true) {
        updatedData.estado = 'inactivo';
      } 
      // Si se actualiza la fecha, recalcular el estado (solo si no está escaneado)
      else if (updatedData.fecha_salida) {
        // Necesitamos verificar si el ticket ya está escaneado
        const routeToUpdate = routes.find(r => r.id === id) || userRoutes.find(r => r.id === id);
        if (routeToUpdate && !routeToUpdate.escaneado) {
          updatedData.estado = determinarEstadoRuta(updatedData.fecha_salida);
        }
      }
      
      const routeRef = doc(db, 'client_routes', id);
      await updateDoc(routeRef, updatedData);
      
      // Update local state
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === id ? { ...route, ...updatedData } : route
        )
      );
      
      setUserRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === id ? { ...route, ...updatedData } : route
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating route:', err);
      setError('Error al actualizar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Función específica para marcar un ticket como escaneado
  const marcarComoEscaneado = async (id: string): Promise<boolean> => {
    try {
      return await updateRoute(id, { escaneado: true, estado: 'inactivo' });
    } catch (err) {
      console.error('Error al marcar ticket como escaneado:', err);
      setError('Error al marcar el ticket como escaneado');
      return false;
    }
  };

  // Delete a route
  const deleteRoute = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'client_routes', id));
      
      // Update local state
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      setUserRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting route:', err);
      setError('Error al eliminar la ruta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  // Load user routes when user changes
  useEffect(() => {
    if (userData?.id) {
      getUserRoutes();
    }
  }, [userData?.id, getUserRoutes]);

  // Initial load of all routes
  useEffect(() => {
    getRoutes();
  }, [getRoutes]);

  return (
    <RoutesContext.Provider
      value={{
        routes,
        userRoutes,
        loading,
        error,
        addRoute,
        updateRoute,
        deleteRoute,
        getUserRoutes,
        getRoutes,
        clearError,
        marcarComoEscaneado,
      }}
    >
      {children}
    </RoutesContext.Provider>
  );
}

// Custom hook to use the routes context
export function useRoutes() {
  const context = useContext(RoutesContext);
  if (context === undefined) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
}