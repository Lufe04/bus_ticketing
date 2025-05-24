import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/FirebaseConfig';
import { useUser } from '../../../context/UserContext';
import { useBoarding } from '../../../context/BoardingContext';
import { getCoordinates } from '../../../utils/geocode';
import MapViewDirections from 'react-native-maps-directions'

const DISTANCIA_MAXIMA_METROS = 200;

export default function RouteInProgressScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const { getCurrentBoarding } = useBoarding();
  const boarding = getCurrentBoarding();

  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [paradaCoords, setParadaCoords] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [loadingParadas, setLoadingParadas] = useState(false);
  const [canStartTrip, setCanStartTrip] = useState(false);

  // Obtener ubicación actual
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(currentLocation);
      }
    })();
  }, []);


  // Obtener coordenadas de paradas automáticamente
  useEffect(() => {
    const fetchAllStopCoordinates = async () => {
      if (!boarding?.paradas) return;
      setLoadingParadas(true);
      const coordsArray: { lat: number; lon: number; label: string }[] = [];

      for (const stop of boarding.paradas) {
        try {
          const coords = await getCoordinates(stop);
          if (coords) {
            console.log(`📍 Coordenadas para ${stop}:`, coords);
            coordsArray.push({ ...coords, label: stop });
          } else {
            console.warn(`⚠️ No se encontraron coordenadas para ${stop}`);
          }
        } catch (error) {
          console.error(`❌ Error al buscar coordenadas para ${stop}:`, error);
        }
      }

      setParadaCoords(coordsArray);
      setLoadingParadas(false);
    };

    fetchAllStopCoordinates();
  }, [boarding?.paradas]);

 useEffect(() => {
    const simulateDriverRoute = async () => {
      if (paradaCoords.length === 0 || !mapRef.current) return;

      for (let i = 0; i < paradaCoords.length; i++) {
        const stop = paradaCoords[i];

        const simulatedLocation: Location.LocationObject = {
          coords: {
            latitude: stop.lat,
            longitude: stop.lon,
            altitude: 0,
            accuracy: 5,
            heading: 0,
            speed: 0,
            altitudeAccuracy: null,
          },
          mocked: true,
          timestamp: Date.now(),
        };

        // 1. Mueve la cámara en 3 segundos (animación suave al nuevo punto)
        mapRef.current.animateToRegion(
          {
            latitude: stop.lat,
            longitude: stop.lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          3000 // animación de 3 segundos
        );

        // 2. Espera esos 3 segundos antes de cambiar la ubicación
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 3. Actualiza la ubicación simulada (la que usa useEffect para verificar cercanía)
        setLocation(simulatedLocation);

        console.log(`🚌 Llegando a parada ${i + 1}:`, simulatedLocation.coords);

        // 4. Espera 10 segundos en esta parada
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    };

    simulateDriverRoute();
  }, [paradaCoords]);





  // Validar si está cerca al terminal
  useEffect(() => {
    if (location && paradaCoords.length > 0) {
      const firstStop = paradaCoords[0];
      const distance = getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude: firstStop.lat, longitude: firstStop.lon }
      );
      console.log(`📏 Distancia al terminal: ${distance} metros`);
      setCanStartTrip(distance <= DISTANCIA_MAXIMA_METROS);
    }
  }, [location, paradaCoords]);

  const handleStartTrip = async () => {
    if (!boarding?.id) return;

    try {
      const boardingRef = doc(db, 'boarding', boarding.id);
      await updateDoc(boardingRef, { estado: 'en_curso' });
      console.log('✅ Estado del viaje actualizado a "en_curso"');
    } catch (error) {
      console.error('❌ Error al actualizar el estado del viaje:', error);
    }
  };


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Ruta en curso</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>{userData?.nombre?.charAt(0).toUpperCase() ?? 'U'}</Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
          >
            {paradaCoords.map((parada, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: parada.lat, longitude: parada.lon }}
                title={parada.label}
              />
            ))}
          </MapView>
        ) : (
          <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#08173B" />
        )}
      </View>

      {/* Información de la ruta */}
      <View style={styles.infoCard}>
        <View style={styles.routeRow}>
          <Text style={styles.routeCity}>{boarding?.desde ?? '—'}</Text>
          <MaterialIcons name="east" size={21} color="#000" />
          <Text style={styles.routeCity}>{boarding?.hasta ?? '—'}</Text>
        </View>
        <View style={styles.routeStops}>
          {boarding?.paradas?.map((stop, index) => (
            <View key={index} style={styles.stopRow}>
              <MaterialCommunityIcons name={index === 0 ? 'map-marker-radius-outline' : 'map-marker-outline'} size={18} />
              <Text style={styles.stopText}>{stop}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, !canStartTrip && { backgroundColor: '#ccc' }]}
          onPress={handleStartTrip}
          disabled={!canStartTrip}
        >
          <MaterialIcons name="directions-bus" size={38} color="#fff" />
          <Text style={styles.actionText}>Iniciar</Text>
          <Text style={styles.actionText}>Viaje</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, boarding?.estado !== 'en_curso' && { backgroundColor: '#ccc' }]}
          disabled={boarding?.estado !== 'en_curso'}
        >
          <MaterialIcons name="my-location" size={38} color="#fff" />
          <Text style={styles.actionText}>Parada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, boarding?.estado !== 'en_curso' && { backgroundColor: '#ccc' }]}
          disabled={boarding?.estado !== 'en_curso'}
          onPress={() => router.navigate("/driver/summary")}
        >
          <MaterialCommunityIcons name="flag-outline" size={38} color="#fff" />
          <Text style={styles.actionText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    backgroundColor: '#08173B',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '400' },
  userCircle: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: { color: '#08173B', fontWeight: '500', fontSize: 32 },
  mapContainer: { height: 250 },
  map: { flex: 1 },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  routeCity: { fontWeight: '700', fontSize: 20 },
  routeStops: { gap: 10 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopText: { fontSize: 18, color: '#000' },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: '#08173B',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: 105,
    height: 105,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
});
