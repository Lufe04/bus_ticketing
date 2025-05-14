import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RouteInfoScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" style={{ marginRight: 10 }} onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Información de la ruta</Text>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      {/* Ruta en curso */}
      <Text style={styles.sectionTitle}>Ruta en Curso</Text>

      <View style={styles.card}>
        <View style={styles.routeRow}>
          <Text style={styles.routeCity}>Cúcuta</Text>
          <MaterialIcons name="east" size={21} color="#000" style={{ marginHorizontal: 6 }} />
          <Text style={styles.routeCity}>Bucaramanga</Text>
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="timer-outline" size={20} color="#989898" />
            <Text style={styles.detailText}>6:00</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="timer-off-outline" size={20} color="#989898" />
            <Text style={styles.detailText}>10:30</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="person-outline" size={20} color="#989898" />
            <Text style={styles.detailText}>18 Pasajeros</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.stopsTitle}>Paradas</Text>
        <View style={styles.stopList}>
          <Text style={styles.stopItem}>{'\u2022'}  Terminal de Cúcuta</Text>
          <Text style={styles.stopItem}>{'\u2022'}  Pamplona</Text>
          <Text style={styles.stopItem}>{'\u2022'}  Terminal de Bucaramanga</Text>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.scanButton} onPress={() => router.navigate('/driver/scan')}>
          <Text style={styles.scanButtonText}>Escanear Pasajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startButton} onPress={() => router.navigate('/driver/routeMap')}>
          <Text style={styles.startButtonText}>Empezar Recorrido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F8FA',
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
    fontWeight: '400',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '400',
    marginTop: 0,
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
    fontSize: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginVertical: 20,
    marginLeft: 20,
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
    gap: 6,
  },
  routeCity: {
    fontWeight: '700',
    fontSize: 20,
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#989898',
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginVertical: 8,
  },
  stopsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 5,
  },
  stopList: {
    gap: 4,
  },
  stopItem: {
    fontSize: 18,
    color: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  startButton: {
    backgroundColor: '#20ADF5',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
});
