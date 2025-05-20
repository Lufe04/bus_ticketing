import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BoardingSummaryScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Resumen de Abordaje</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Pasajero</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>María</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Puesto</Text>
            <Text style={styles.value}>5B</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información General</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Ruta</Text>
            <Text style={styles.valueMuted}>R0001</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Pasajes Escaneados</Text>
            <Text style={styles.value}>1</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Pasajes Sin Escanear</Text>
            <Text style={styles.value}>17</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/driver/scan')}>
          <Text style={styles.scanButtonText}>Escanear Pasajes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endButton} onPress={() => router.push('/driver/route')}>
          <Text style={styles.endButtonText}>Finalizar Escaneo</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
  },
  valueMuted: {
    fontSize: 15,
    fontWeight: '400',
    color: '#989898',
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
  endButton: {
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
  endButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
});
