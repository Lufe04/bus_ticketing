import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../../context/UserContext';
import { db } from '../../../utils/FirebaseConfig';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import LottieView from 'lottie-react-native';

export default function TripSummaryScreen() {
  const router = useRouter();
  const { userData } = useUser();
  const [boarding, setBoarding] = useState<any>(null);
  const [horaSalida, setHoraSalida] = useState('');
  const [horaLlegada, setHoraLlegada] = useState('');
  const [duracion, setDuracion] = useState('');
  const [pasajerosCount, setPasajerosCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener el boarding acabado de finalizar
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'boarding'), where('estado', '==', 'finalizado')),
      async snapshot => {
        type BoardingData = {
        id: string;
        paradas: string[];
        desde: string;
        hasta: string;
        hora_fin: any;
      };

      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardingData[];
      const finalizado = docs[0];

        if (!finalizado) {
          setBoarding(null);
          return;
        }
        setBoarding(finalizado);

        //  Buscar en el historial de paradas
        const historialSnap = await getDocs(collection(db, `boarding/${finalizado.id}/historial_paradas`));
        const historial = historialSnap.docs.map(d => d.data());
        const salidaTS = historial.find(p => p.nombre === finalizado.paradas[0])?.timestamp?.toDate();
        const llegadaTS = historial.find(p => p.nombre === finalizado.paradas.at(-1))?.timestamp?.toDate();

        if (salidaTS && llegadaTS) {
          const durationMs = llegadaTS.getTime() - salidaTS.getTime();
          const durationSec = Math.floor(durationMs / 1000);
          const hours = Math.floor(durationSec / 3600);
          const minutes = Math.floor((durationSec % 3600) / 60);
          const seconds = durationSec % 60;
          const duracionStr = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          
          setHoraSalida(
            salidaTS.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          setHoraLlegada(
            llegadaTS.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
          setDuracion(duracionStr);
        } else {
          console.warn('Error al calcular duración: timestamps faltantes');
        }

        // Buscar número de pasajeros escaneados
        const pasajerosSnap = await getDocs(collection(db, `boarding/${finalizado.id}/pasajeros`));
        const escaneados = pasajerosSnap.docs.filter(d => d.data().escaneado === true).length;
        setPasajerosCount(escaneados);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Si aún está cargando, mostrar un indicador de carga y si no se encontro el boarding, mostrar un mensaje
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#08173B" />
      </View>
    );
  }
  if (!boarding) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20, fontSize: 18 }}>No hay viajes finalizados para mostrar.</Text>
      </View>
    );
  }

  const fecha = boarding.hora_fin?.toDate().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen</Text>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>{userData?.nombre?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <LottieView
          source={require('../../../assets/lottie/success.json')}
          autoPlay
          loop={false}
          style={{ width: 150, height: 150 }}
        />
        <Text style={styles.successText}>Viaje Finalizado</Text>
        <View style={styles.left}>
          <View style={styles.routeRow}>
            <Text style={styles.routeText}>{boarding.desde}</Text>
            <MaterialIcons name="east" size={25} />
            <Text style={styles.routeText}>{boarding.hasta}</Text>
          </View>
          <Text style={styles.dateText}>{fecha}</Text>
        </View>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryCard}>
          <View style={styles.rowBetween}><Text style={styles.label}>Hora de Salida</Text><Text style={styles.value}>{horaSalida}</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Hora de Llegada</Text><Text style={styles.value}>{horaLlegada}</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Duración Total</Text><Text style={styles.value}>{duracion}</Text></View>
          <View style={styles.rowBetween}><Text style={styles.label}>Número de Pasajeros</Text><Text style={styles.value}>{pasajerosCount}</Text></View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finalButton} onPress={() => router.push('/driver')}>
          <Text style={styles.finalButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F8FA' 
  },
  header: {
    backgroundColor: '#08173B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: '400' 
  },
  userCircle: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: { 
    color: '#08173B', 
    fontWeight: '500', 
    fontSize: 32 
  },
  content: { 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 0 
  },
  successText: { 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 20, 
    color: '#000' 
  },
  routeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 0, 
    gap: 12 
  },
  left: { 
    alignItems: 'flex-start', 
    width: '100%' 
  },
  routeText: { 
    fontSize: 25, 
    fontWeight: '600', 
    marginBottom: 4 
  },
  dateText: { 
    fontSize: 20, 
    color: '#989898', 
    marginBottom: 30, 
    fontWeight: '400' 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000', 
    alignSelf: 'flex-start', 
    marginBottom: 15 
  },
  summaryCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderColor: '#D9D9D9', 
    borderWidth: 1, 
    width: '100%', 
    padding: 16, 
    gap: 12 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  label: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#000' 
  },
  value: { 
    fontSize: 15, 
    fontWeight: '400', 
    color: '#000' 
  },
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 0, 
    right: 0, 
    alignItems: 'center' 
  },
  finalButton: { 
    backgroundColor: '#08173B', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 14, 
    width: '80%', 
    alignItems: 'center' 
  },
  finalButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '700', 
    fontSize: 18 
  },
});
