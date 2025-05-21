import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';

// Paleta de colores consistente
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
};

export default function MapScreen() {
  const { currentUser } = useAuth();
  const { userData } = useUser();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  // Estados
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Solicitar permisos de ubicación y obtener ubicación actual
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Se requieren permisos de ubicación para utilizar esta función');
        setIsLoading(false);
        return;
      }
      
      try {
        // Obtener ubicación actual
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error al obtener ubicación:', error);
        setErrorMsg('No se pudo obtener la ubicación. Por favor, inténtalo de nuevo.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Centrar el mapa en la ubicación actual
  const centerMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  // Si no hay datos del usuario, mostrar pantalla de carga
  if (!userData && !isLoading && !errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.skyBlue} />
          <Text style={styles.loadingText}>Cargando información de usuario...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar contenido según estado
  let content;
  
  if (isLoading) {
    content = (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.skyBlue} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  } else if (errorMsg) {
    content = (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/client/mapScreen')}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (location) {
    content = (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={userData?.nombre ? `${userData.nombre}` : 'Tu ubicación'}
            description="Estás aquí"
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Ionicons name="person" size={16} color={COLORS.white} />
              </View>
            </View>
          </Marker>
        </MapView>
        
        {/* Botón para centrar el mapa */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={centerMap}
        >
          <Ionicons name="locate" size={24} color={COLORS.primaryBlue} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Contenido principal (sin header) */}
      <View style={styles.fullContent}>
        {content}
      </View>
<<<<<<< HEAD
=======
    
>>>>>>> temp-fix-branch
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fullContent: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.white,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: COLORS.skyBlue,
    padding: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.white,
  }
});