import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getDistance } from 'geolib';
import { addDoc, collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/FirebaseConfig';
import { useUser } from '../../../context/UserContext';
import { useBoarding } from '../../../context/BoardingContext';
import { getCoordinates } from '../../../utils/geocode';
import TripConfirmationModal from '../../../components/TripModal';

const DISTANCIA_MAXIMA_METROS = 200;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RouteInProgressScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const { getCurrentBoarding } = useBoarding();
  const initialBoarding = getCurrentBoarding();

  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [paradaCoords, setParadaCoords] = useState<{ lat: number; lon: number; label: string }[]>([]);
  const [canStartTrip, setCanStartTrip] = useState(false);
  const [canMarkStop, setCanMarkStop] = useState(false);
  const [canEndTrip, setCanEndTrip] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'start' | 'arrival' | 'end'>('start');
  const [selectedStopName, setSelectedStopName] = useState('');
  const [boarding, setBoarding] = useState(initialBoarding);
  const [notificacionProgramada, setNotificacionProgramada] = useState(false);

  // Listener al documento del viaje
  useEffect(() => {
    if (!initialBoarding?.id) return;
    const boardingRef = doc(db, 'boarding', initialBoarding.id);
    const unsubscribe = onSnapshot(boardingRef, (docSnap) => {
      if (docSnap.exists()) {
        setBoarding({ id: docSnap.id, ...docSnap.data() } as any);
      }
    });
    return unsubscribe;
  }, [initialBoarding?.id]);

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

  // Obtener coordenadas de las paradas
  useEffect(() => {
    const fetchAllStopCoordinates = async () => {
      if (!boarding?.paradas) return;
      const coordsArray = [];
      for (const stop of boarding.paradas) {
        const coords = await getCoordinates(stop);
        if (coords) coordsArray.push({ ...coords, label: stop });
      }
      setParadaCoords(coordsArray);
    };
    fetchAllStopCoordinates();
  }, [boarding?.paradas]);

  // Verificar cercanía
  useEffect(() => {
    if (!location || paradaCoords.length === 0 || !boarding) return;
    const currentCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    if (boarding.estado === 'programado') {
      const firstStop = paradaCoords[0];
      const distToFirst = getDistance(currentCoords, { latitude: firstStop.lat, longitude: firstStop.lon });
      setCanStartTrip(distToFirst <= DISTANCIA_MAXIMA_METROS);
    }
  }, [location, boarding?.estado, paradaCoords]);

  // Habilitar botones cuando esté en curso
  useEffect(() => {
    if (boarding?.estado === 'en_curso') {
      setCanMarkStop(true);
      setCanEndTrip(true);
    }
  }, [boarding?.estado]);

  // Acción confirmada (inicio, parada, finalización)
  const handleConfirmAction = async () => {
    if (!boarding?.id || !selectedStopName) return;

    const now = new Date();
    const horaLlegada = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const boardingRef = doc(db, 'boarding', boarding.id);
    const historialRef = collection(db, `boarding/${boarding.id}/historial_paradas`);

    try {
      let newEstado = boarding.estado;
      if (modalAction === 'start') newEstado = 'en_curso';
      if (modalAction === 'end') newEstado = 'finalizado';

      await updateDoc(boardingRef, {
        estado: newEstado,
        parada_actual: selectedStopName,
        hora_llegada: horaLlegada,
      });

      await addDoc(historialRef, {
        nombre: selectedStopName,
        hora_llegada: horaLlegada,
        timestamp: now,
      });

      if (modalAction === 'end') {
        console.log('📢 Notificación: Califica tu viaje en 3 horas (simulada en 2 seg)');

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Recuerda calificar tu viaje',
            body: 'Tu opinión es importante para mejorar el servicio',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 2, // en producción: 3 * 60 * 60
          },
        });

        router.push('/driver/summary');
      }

    } catch (err) {
      console.error('❌ Error al actualizar el viaje:', err);
    }

    setModalVisible(false);
  };

  useEffect(() => {
    if (!boarding?.hora_inicio || boarding.estado !== 'programado'|| notificacionProgramada) return;

    const now = Date.now();
    const inicio = boarding.hora_inicio.toDate().getTime();
    const diff = inicio - now;

    if (diff > 0 && diff <= 5 * 60 * 1000) {
      console.log('🕐 Notificación: El viaje está por comenzar en 5 minutos');

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tu viaje está por comenzar 🚍',
          body: 'No olvides registrarte con el conductor',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2, // solo para pruebas. Usa 300 en producción
        },
      });
      setNotificacionProgramada(true);
    }
  }, [boarding, notificacionProgramada]);



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
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
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
