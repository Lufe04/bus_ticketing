import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/FirebaseConfig';
import { useUser } from '../../../context/UserContext';
import { useBoarding } from '../../../context/BoardingContext';
import { getCoordinates } from '../../../utils/geocode';
import TripConfirmationModal from '../../../components/TripModal';

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
  const [canMarkStop, setCanMarkStop] = useState(false);
  const [canEndTrip, setCanEndTrip] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'start' | 'arrival' | 'end'>('start');
  const [selectedStopName, setSelectedStopName] = useState('');

  // Obtener ubicación
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(currentLocation);
      }
    })();
  }, []);

  // Obtener coordenadas de las paradas
  useEffect(() => {
    const fetchAllStopCoordinates = async () => {
      if (!boarding?.paradas) return;
      setLoadingParadas(true);
      const coordsArray: { lat: number; lon: number; label: string }[] = [];

      for (const stop of boarding.paradas) {
        const coords = await getCoordinates(stop);
        if (coords) coordsArray.push({ ...coords, label: stop });
      }

      setParadaCoords(coordsArray);
      setLoadingParadas(false);
    };

    fetchAllStopCoordinates();
  }, [boarding?.paradas]);

  // Simular movimiento del conductor 
  useEffect(() => {
    const simulateDriverRoute = async () => {
      if (paradaCoords.length === 0 || !mapRef.current) return;

      for (const stop of paradaCoords) {
        mapRef.current.animateToRegion(
          {
            latitude: stop.lat,
            longitude: stop.lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          3000
        );
        await new Promise(res => setTimeout(res, 3000));
        setLocation({
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
        });
        await new Promise(res => setTimeout(res, 10000));
      }
    };

    simulateDriverRoute();
  }, [paradaCoords]);

  // Verificar cercanía
  useEffect(() => {
  if (!location || paradaCoords.length === 0 || !boarding) return;

  const { latitude, longitude } = location.coords;
  const currentCoords = { latitude, longitude };

  console.log('📌 Estado del viaje:', boarding.estado);
  console.log('📌 Parada actual:', boarding.parada_actual);
  console.log('📌 Coordenadas actuales:', currentCoords);

  if (boarding.estado === 'programado') {
    const firstStop = paradaCoords[0];
    const distToFirst = getDistance(currentCoords, { latitude: firstStop.lat, longitude: firstStop.lon });
    console.log('📏 Distancia a primera parada:', distToFirst);
    setCanStartTrip(distToFirst <= DISTANCIA_MAXIMA_METROS);
    setCanMarkStop(false);
    setCanEndTrip(false);
  }

  if (boarding.estado === 'en_curso') {
    const currentIndex = paradaCoords.findIndex(p => p.label === boarding.parada_actual);
    console.log('🔍 Índice de parada actual:', currentIndex);

    if (currentIndex !== -1) {
      const nextStop = paradaCoords[currentIndex + 1];
      if (nextStop) {
        const distToNext = getDistance(currentCoords, {
          latitude: nextStop.lat,
          longitude: nextStop.lon,
        });
        console.log('➡️ Próxima parada:', nextStop.label);
        console.log('📏 Distancia a próxima parada:', distToNext);
        setCanMarkStop(distToNext <= DISTANCIA_MAXIMA_METROS);
      } else {
        setCanMarkStop(false);
      }
    } else {
      console.warn('⚠️ No se encontró la parada actual en la lista de coordenadas');
      setCanMarkStop(false);
    }

    const lastStop = paradaCoords[paradaCoords.length - 1];
    const distToLast = getDistance(currentCoords, {
      latitude: lastStop.lat,
      longitude: lastStop.lon,
    });
    console.log('🏁 Última parada:', lastStop.label);
    console.log('📏 Distancia a parada final:', distToLast);
    setCanEndTrip(distToLast <= DISTANCIA_MAXIMA_METROS);
    setCanStartTrip(false);
  }

  if (boarding.estado === 'finalizado') {
    setCanStartTrip(false);
    setCanMarkStop(false);
    setCanEndTrip(false);
  }
}, [location, boarding?.estado, boarding?.parada_actual, paradaCoords]);


  // Confirmar acción del modal
  const handleConfirmAction = async () => {
    if (!boarding?.id || !selectedStopName) return;

    const now = new Date();
    const horaLlegada = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const boardingRef = doc(db, 'boarding', boarding.id);
    const historialRef = collection(db, `boarding/${boarding.id}/historial_paradas`);

    try {
      if (modalAction === 'start') {
        await updateDoc(boardingRef, {
          estado: 'en_curso',
          parada_actual: selectedStopName,
          hora_llegada: horaLlegada,
        });
      } else if (modalAction === 'arrival') {
        await updateDoc(boardingRef, {
          parada_actual: selectedStopName,
          hora_llegada: horaLlegada,
        });
      } else if (modalAction === 'end') {
        await updateDoc(boardingRef, {
          estado: 'finalizado',
          parada_actual: selectedStopName,
          hora_llegada: horaLlegada,
        });
      }

      await addDoc(historialRef, {
        nombre: selectedStopName,
        hora_llegada: horaLlegada,
        timestamp: now,
      });

      console.log(`✅ Acción "${modalAction}" registrada`);
    } catch (err) {
      console.error('❌ Error:', err);
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#fff" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Ruta en curso</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>{userData?.nombre?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
      </View>

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
            showsUserLocation
          >
            {paradaCoords.map((p, i) => (
              <Marker key={i} coordinate={{ latitude: p.lat, longitude: p.lon }} title={p.label} />
            ))}
          </MapView>
        ) : (
          <ActivityIndicator size="large" color="#08173B" style={{ marginTop: 20 }} />
        )}
      </View>

      <View style={styles.infoCard}>
        <View style={styles.routeRow}>
          <Text style={styles.routeCity}>{boarding?.desde ?? '—'}</Text>
          <MaterialIcons name="east" size={21} color="#000" />
          <Text style={styles.routeCity}>{boarding?.hasta ?? '—'}</Text>
        </View>
        <View style={styles.routeStops}>
          {boarding?.paradas?.map((s, i) => (
            <View key={i} style={styles.stopRow}>
              <MaterialCommunityIcons name={i === 0 ? 'map-marker-radius-outline' : 'map-marker-outline'} size={18} />
              <Text style={styles.stopText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          disabled={!canStartTrip}
          style={[styles.actionButton, (boarding?.estado !== 'programado' || !canStartTrip) && { backgroundColor: '#ccc' }]}
          onPress={() => {
            setModalAction('start');
            setSelectedStopName(paradaCoords[0]?.label || '');
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="directions-bus" size={38} color="#fff" />
          <Text style={styles.actionText}>Iniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canMarkStop}
          style={[styles.actionButton, !canMarkStop && { backgroundColor: '#ccc' }]}
          onPress={() => {
            const next = paradaCoords.find(p => p.label !== boarding?.parada_actual);
            setModalAction('arrival');
            setSelectedStopName(next?.label || '');
            setModalVisible(true);
          }}
        >
          <MaterialIcons name="my-location" size={38} color="#fff" />
          <Text style={styles.actionText}>Parada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!canEndTrip}
          style={[styles.actionButton, !canEndTrip && { backgroundColor: '#ccc' }]}
          onPress={() => {
            setModalAction('end');
            setSelectedStopName(paradaCoords[paradaCoords.length - 1]?.label || '');
            setModalVisible(true);
          }}
        >
          <MaterialCommunityIcons name="flag-outline" size={38} color="#fff" />
          <Text style={styles.actionText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <TripConfirmationModal
        visible={modalVisible}
        action={modalAction}
        stopName={selectedStopName}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleConfirmAction}
      />
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
