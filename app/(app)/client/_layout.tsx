<<<<<<< HEAD
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';

// Paleta de colores consistente
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  white: '#FFFFFF',
};

export default function TabLayout() {
  // Usamos ambos contextos
  const { currentUser, isAuthenticated } = useAuth();
  const { userData, isLoading: isUserDataLoading, refreshUserData } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Verificamos que el usuario esté autenticado y sus datos estén cargados
  useEffect(() => {
    // Si ya está autenticado y tenemos datos de usuario, no esperamos
    if (isAuthenticated && userData) {
      setIsLoading(false);
      setError(null);
      console.log("Usuario autenticado:", userData.nombre);
      return;
    }
    
    // Si está autenticado pero todavía no tenemos datos, es posible que estén cargando
    if (isAuthenticated && isUserDataLoading) {
      console.log("Usuario autenticado, esperando datos...");
      return; // No cambiar estado de carga mientras se están cargando datos
    }
    
    // Si está autenticado pero no hay datos y no están cargando, intentamos obtenerlos manualmente
    if (isAuthenticated && !isUserDataLoading && !userData) {
      console.warn("Usuario autenticado pero no se encontraron datos. Intentando recargar...");
      
      // Si ya intentamos varias veces, mostramos un error
      if (retryCount >= 2) {
        setError("No se pudieron cargar los datos del usuario después de varios intentos.");
        setIsLoading(false);
        return;
      }
      
      // Intentar recargar los datos manualmente
      const loadData = async () => {
        try {
          await refreshUserData();
          if (!userData) {
            setRetryCount(prev => prev + 1);
          }
        } catch (error) {
          console.error("Error al recargar datos:", error);
          setRetryCount(prev => prev + 1);
        }
      };
      
      loadData();
      return;
    }
    
    // Si no está autenticado, damos un tiempo razonable y luego redirigimos al login
    if (!isAuthenticated) {
      const timeout = setTimeout(() => {
        console.warn("Tiempo de espera agotado para la autenticación");
        router.replace("/auth");
      }, 3000); // 3 segundos de timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, userData, isUserDataLoading, retryCount, refreshUserData, router]);

  // Manejar reintentos
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    refreshUserData();
  };

  // Mostrar pantalla de error si hay problemas
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.skyBlue} />
        <Text style={{ marginTop: 20, fontSize: 16, textAlign: 'center', color: COLORS.primaryBlue, marginBottom: 20 }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: COLORS.skyBlue, 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            borderRadius: 8 
          }}
          onPress={handleRetry}
        >
          <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ marginTop: 12 }}
          onPress={() => router.replace("/auth")}
        >
          <Text style={{ color: COLORS.gray }}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mostrar pantalla de carga mientras verificamos la autenticación o cargamos datos
  if ((isLoading && !isAuthenticated) || (isAuthenticated && isUserDataLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.skyBlue} />
        <Text style={{ marginTop: 20, color: COLORS.primaryBlue }}>
          {isAuthenticated ? "Cargando datos de usuario..." : "Verificando autenticación..."}
        </Text>
      </View>
    );
  }

=======
import React from 'react';
import { Stack, Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

// Constantes para colores consistentes
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  white: '#FFFFFF',
};

export default function ClientLayout() {
>>>>>>> temp-fix-branch
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.skyBlue,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
<<<<<<< HEAD
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
=======
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
>>>>>>> temp-fix-branch
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
<<<<<<< HEAD
        },
      }}
    >
      {/* Las definiciones de Tabs.Screen se mantienen igual */}
=======
        }
      }}
    >
      {/* Inicio (Home) Tab */}
>>>>>>> temp-fix-branch
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
<<<<<<< HEAD
            <Ionicons name="home" size={size} color={color} />
=======
            <Ionicons name="home-outline" size={size} color={color} />
>>>>>>> temp-fix-branch
          ),
        }}
      />
      
<<<<<<< HEAD
=======
      {/* Saldo (Balance) Tab */}
>>>>>>> temp-fix-branch
      <Tabs.Screen
        name="saldoScreen"
        options={{
          title: "Saldo",
          tabBarIcon: ({ color, size }) => (
<<<<<<< HEAD
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      {/* El resto de las pantallas se mantienen igual */}
=======
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Mapa (Map) Tab */}
      <Tabs.Screen
        name="mapScreen"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Chat Tab */}
      <Tabs.Screen
        name="chatScreen"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Screens that don't appear in tabs but need to be accessible */}
      <Tabs.Screen
        name="selectScreen"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
      
      <Tabs.Screen
        name="ticketsScreen"
        options={{
          href: null, // This hides the tab but keeps the screen accessible via navigation
        }}
      />
>>>>>>> temp-fix-branch
    </Tabs>
  );
}