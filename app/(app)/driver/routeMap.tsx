import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RouteInProgressScreen() {
    const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" style={{ marginRight: 10 }} onPress={() => router.back()}/>
          <Text style={styles.headerTitle}>Ruta en curso</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}></View>
        <Text style={styles.mapLabel}>Bucaramanga</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.routeRow}>
            <Text style={styles.routeCity}>Cúcuta</Text>
            <MaterialIcons name="east" size={21} color="#000" style={{ marginHorizontal: 6 }} />
            <Text style={styles.routeCity}>Bucaramanga</Text>
        </View>
        <View style={styles.routeStops}>
          <View style={styles.stopRow}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={18} />
            <Text style={styles.stopText}>Terminal de Cúcuta</Text>
          </View>
          <View style={styles.stopRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} />
            <Text style={styles.stopText}>Pamplona</Text>
          </View>
          <View style={styles.stopRow}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={18} />
            <Text style={styles.stopText}>Terminal de Bucaramanga</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="directions-bus" size={38} color="#fff" />
          <Text style={styles.actionText}>Iniciar</Text>
          <Text style={[styles.actionText, { marginTop: 0 }]}>Viaje</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="my-location" size={38} color="#fff" />
          <Text style={styles.actionText}>Marcar Parada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="flag-outline" size={38} color="#fff" onPress={() => router.navigate("/driver/summary")}/>
          <Text style={styles.actionText}>Finalizar Viaje</Text>
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
  mapContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#E0E0E0',
  },
  mapLabel: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '600',
    fontSize: 14,
  },
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
  routeCity: {
    fontWeight: '700',
    fontSize: 20,
  },
  routeLabel: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 10,
  },
  routeStops: {
    gap: 10,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopText: {
    fontSize: 18,
    color: '#000',
  },
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
