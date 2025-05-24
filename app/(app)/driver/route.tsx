import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBoarding } from '../../../context/BoardingContext';
import { useUser } from '../../../context/UserContext';
import UserMenuModal from '../../../components/UserModal';

export default function RouteInfoScreen() {
  const router = useRouter();
  const { getCurrentBoarding } = useBoarding();
  const { userData } = useUser();
  const boarding = getCurrentBoarding();
  const [menuVisible, setMenuVisible] = useState(false);

  const nombreUsuario = userData?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const scannedCount = boarding?.pasajeros_lista?.filter(p => p.escaneado).length || 0;
  const totalPasajeros = boarding?.pasajeros || 0;
  const isRouteStarted = boarding?.estado === 'en_curso';
  const isScanComplete = scannedCount >= totalPasajeros;
  const disableScanButton = isScanComplete || isRouteStarted;
  const disableStartButton = scannedCount === 0;

  const formatTime = (timestamp: any) => {
    if (!timestamp?.toDate) return '—';
    const date = timestamp.toDate();
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Información de la ruta</Text>
        </View>
        <TouchableOpacity style={styles.userCircle} onPress={() => setMenuVisible(true)}>
          <Text style={styles.userInitial}>{inicial}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Ruta en Curso</Text>

      {boarding && (
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <Text style={styles.routeCity}>{boarding.desde}</Text>
            <MaterialIcons name="east" size={21} color="#000" />
            <Text style={styles.routeCity}>{boarding.hasta}</Text>
          </View>

          <View style={styles.routeDetails}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="timer-outline" size={20} color="#989898" />
              <Text style={styles.detailText}>{formatTime(boarding.hora_inicio)}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="timer-off-outline" size={20} color="#989898" />
              <Text style={styles.detailText}>{formatTime(boarding.hora_fin)}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialIcons name="person-outline" size={20} color="#989898" />
              <Text style={styles.detailText}>{totalPasajeros} Pasajeros</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.stopsTitle}>Paradas</Text>
          <View style={styles.stopList}>
            {boarding.paradas.map((p, idx) => (
              <Text key={idx} style={styles.stopItem}>{'\u2022'} {p}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.scanButton, disableScanButton && { backgroundColor: '#ccc' }]}
          //disabled={disableScanButton}
          onPress={() => router.push('/driver/scan')}
        >
          <Text style={styles.scanButtonText}>Escanear Pasajes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, disableStartButton && { backgroundColor: '#ccc' }]}
          disabled={disableStartButton}
          onPress={() => router.push('/driver/routeMap')}
        >
          <Text style={styles.startButtonText}>
            {isRouteStarted ? 'Continuar Recorrido' : 'Empezar Recorrido'}
          </Text>
        </TouchableOpacity>
      </View>
      <UserMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F8FA' 
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  header: {
    backgroundColor: '#08173B', 
    padding: 20,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
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
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#000', 
    marginVertical: 20, 
    marginLeft: 20 
  },
  card: {
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 16,
    borderColor: '#D9D9D9', 
    borderWidth: 1, 
    marginHorizontal: 20,
  },
  routeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10, 
    gap: 6 
  },
  routeCity: { 
    fontWeight: '700', 
    fontSize: 20 
  },
  routeDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  detailText: { 
    color: '#989898', 
    fontSize: 18, 
    fontWeight: '400', 
    marginLeft: 2 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#D9D9D9', 
    marginVertical: 8 
  },
  stopsTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 12, 
    marginTop: 5 
  },
  stopList: { 
    gap: 4 
  },
  stopItem: { 
    fontSize: 18, 
    color: '#000' 
  },
  buttonsContainer: {
    position: 'absolute', 
    bottom: 30, 
    left: 16, 
    right: 16, 
    alignItems: 'center', 
    gap: 12,
  },
  scanButton: {
    backgroundColor: '#08173B', 
    paddingVertical: 8, 
    paddingHorizontal: 30,
    borderRadius: 15, 
    width: '80%', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4,
  },
  scanButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 18 
  },
  startButton: {
    backgroundColor: '#20ADF5', 
    paddingVertical: 8, 
    paddingHorizontal: 30,
    borderRadius: 15, 
    width: '80%', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4,
  },
  startButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 18 
  },
});
