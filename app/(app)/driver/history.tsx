import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DriverHistoryScreen() {
  const router = useRouter();

  const completedRoutes = [
    {
      date: '4 de Abril de 2025',
      routes: [
        { from: 'Cartagena', to: 'Sincelejo', duration: '4 h' },
        { from: 'Sincelejo', to: 'Montería', duration: '2 h 30 min' },
      ],
    },
    {
      date: '9 de Abril de 2025',
      routes: [
        { from: 'Bogotá', to: 'Tunja', duration: '3 h' },
        { from: 'Tunja', to: 'Sogamoso', duration: '1 h 30 min' },
        { from: 'Sogamoso', to: 'Yopal', duration: '6 h' },
      ],
    },
    {
      date: '14 de Abril de 2025',
      routes: [
        { from: 'Bogotá', to: 'Tunja', duration: '3 h' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hola, Usuario</Text>
          <Text style={styles.headerSubtitle}>Visualiza tus rutas completadas</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>Abril</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>2025</Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {completedRoutes.map((group, index) => (
          <View key={index}>
            <Text style={styles.dateText}>{group.date}</Text>
            {group.routes.map((route, idx) => (
              <View key={idx} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <MaterialIcons name="directions-bus" size={24} color='rgba(50, 50, 50, 0.8)' style={{ marginRight: 8 }} />
                  <Text style={styles.routeCity}>{route.from}</Text>
                  <MaterialIcons name="east" size={20} color='rgba(50, 50, 50, 0.8)' style={{ marginHorizontal: 6 }} />
                  <Text style={styles.routeCity}>{route.to}</Text>
                </View>
                <View style={styles.routeFooter}>
                  <MaterialCommunityIcons name="timer-outline" size={24} color='rgba(50, 50, 50, 0.8)' style={{ marginRight: 6 }} />
                  <Text style={styles.routeDuration}>Duración: {route.duration}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Completado</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.navbar}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="text-box-outline" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver/routes')}/>
          <Text style={styles.navLabel}>Mis Rutas</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home-outline" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver')}/>
          <Text style={styles.navLabel}>Inicio</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="event-available" size={40} style={styles.navbarIconActive}/>
          <Text style={styles.navLabelActive}>Historial</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '600',
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
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    marginRight: 6,
    fontSize: 15,
    fontWeight: '400',
    color: '#000',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(50, 50, 50, 0.8)',
    padding: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeCity: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(50, 50, 50, 0.8)',
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  routeDuration: {
    fontSize: 15,
    color: 'rgba(50, 50, 50, 0.8)',
  },
  statusBadge: {
    backgroundColor: '#43C63C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: "#000000CC",
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  navbarIcon: {
    color: '#000000',
  },
  navbarIconActive: {
    color: '#20ADF5',
  },
  navLabel: {
    fontSize: 12,
    color: '#000',
    marginTop: 2,
  },
  navLabelActive: {
    fontSize: 12,
    color: '#20ADF5',
    marginTop: 2,
    fontWeight: '600',
  },
});
