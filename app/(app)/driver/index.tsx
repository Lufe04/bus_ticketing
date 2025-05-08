import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import UserMenuModal from '../../../components/UserModal';

export default function DriverHomeScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hola, Usuario</Text>
          <Text style={styles.headerSubtitle}>¿Listo para tu próximo viaje?</Text>
        </View>
        <TouchableOpacity style={styles.userCircle} onPress={() => setMenuVisible(true)}>
          <Text style={styles.userInitial}>U</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100}}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tu próxima ruta</Text>
          <View style={styles.routeRow}>
            <Text style={styles.routeCity}>Cúcuta</Text>
            <MaterialIcons name="east" size={21} color="#000000"/>
            <Text style={styles.routeCity}>Bucaramanga</Text>
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.group}>
              <MaterialCommunityIcons name="timer-outline" size={20} color="#989898" style={{ opacity: 0.8 }} />
              <Text style={styles.routeText}>6:00</Text>
            </View>
            <View style={styles.group}>
              <MaterialCommunityIcons name="timer-off-outline" size={20} color="#989898" style={{ opacity: 0.8 }} />
              <Text style={styles.routeText}>10:30</Text>
            </View>
            <View style={styles.group}>
              <MaterialIcons name="person-outline" size={20} color="#989898" style={{ opacity: 0.8 }} />
              <Text style={styles.routeText}>18 Pasajeros</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.startButton} onPress={() => router.navigate('/driver/route')}>
            <Text style={styles.startButtonText}>Iniciar Ruta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle2}>Tus próximas rutas</Text>

        {/* Ruta activa */}
        <View style={styles.routeBoxActive}>
          <View style={styles.routeBoxRow}>
            <MaterialCommunityIcons name="timer-outline" size={24} color='rgba(50, 50, 50, 0.8)' style={styles.routeIcon} />
            <Text style={styles.routeTime}>Hoy, 11:30 - 14:00</Text>
          </View>
          <View style={styles.routeBoxRow}>
            <MaterialIcons name="date-range" size={24} color='rgba(50, 50, 50, 0.8)' style={styles.routeIcon} />
            <Text style={styles.routeTextRow}>Bucaramanga</Text>
            <MaterialIcons name="east" size={20} color='rgba(50, 50, 50, 0.8)'  marginLeft= {10}/>
            <Text style={styles.routeTextRow}>Barrancabermeja</Text>
          </View>
        </View>

        {/* Rutas siguientes */}
        {[{ date: '9 de Mayo, 6:00 - 13:00', route1: 'Barrancabermeja', route2: 'Medellín' },
          { date: '9 de Mayo, 15:00 - 20:00', route1: 'Medellín', route2: 'Manizales' },
          { date: '10 de Mayo, 8:00 - 9:30', route1: 'Manizales', route2: 'Pereira' }].map((item, idx) => (
          <View key={idx} style={styles.routeBoxInactive}>
            <View style={styles.routeBoxRow}>
              <MaterialCommunityIcons name="timer-outline" size={24} color='rgba(50, 50, 50, 0.8)' style={styles.routeIcon} />
              <Text style={styles.routeTimeInactive}>{item.date}</Text>
            </View>
            <View style={styles.routeBoxRow}>
              <MaterialIcons name="date-range" size={24} color='rgba(50, 50, 50, 0.8)' style={styles.routeIcon} />
              <Text style={styles.routeTextRow}>{item.route1}</Text>
              <MaterialIcons name="east" size={20} color='rgba(50, 50, 50, 0.8)' marginLeft= {10} />
              <Text style={styles.routeTextRow}>{item.route2}</Text>
            </View>
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
          <MaterialCommunityIcons name="home-outline" size={40} style={styles.navbarIconActive}/>
          <Text style={styles.navLabelActive}>Inicio</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="event-available" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver/history')} />
          <Text style={styles.navLabel}>Historial</Text>
        </View>
      </View>
      <UserMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 24,
    borderColor: '#D9D9D9',
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
    color: '#000000',
  },
  sectionTitle2: {
    fontWeight: '600',
    fontSize: 20,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
    color: '#000000',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 10,
  },
  routeCity: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
    marginBottom: 0,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  routeText: {
    fontSize: 15,
    color: '#989898',
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#20ADF5', // Fondo azul
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000000', // Color de la sombra (negro)
    shadowOffset: { width: 0, height: 4 }, // Posición de la sombra (X: 0, Y: 4)
    shadowOpacity: 0.25, // Opacidad de la sombra (25%)
    shadowRadius: 4, // Desenfoque de la sombra (Blur: 4)
    elevation: 4, // Para Android (equivalente a la sombra)
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 18,
  },
  routeBoxActive: {
    backgroundColor: '#CDEBFF', // Azul claro
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(50, 50, 50, 0.8)', // Borde gris oscuro
    flexDirection: 'column',
  },
  routeBoxInactive: {
    backgroundColor: 'rgba(152, 152, 152, 0.2)', // Gris claro
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(50, 50, 50, 0.8)', // Borde blanco
    flexDirection: 'column',
  },
  routeBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeTime: {
    fontSize: 15,
    color: 'rgba(50, 50, 50, 0.8)', // Texto gris oscuro
    fontWeight: '400',
    marginLeft: 8,
  },
  routeTextRow: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(50, 50, 50, 0.8)', // Texto gris oscuro
    marginLeft: 8,
  },
  routeTimeInactive: {
    fontSize: 15,
    color: 'rgba(50, 50, 50, 0.8)', // Texto gris claro
    fontWeight: '400',
    marginLeft: 8,
  },
  routeTextRowInactive: {
    fontSize: 15,
    color: 'rgba(50, 50, 50, 0.8)', // Texto gris oscuro
    fontWeight: '400',
    marginLeft: 8,
  },
  routeIcon: {
    marginRight: 8,
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
