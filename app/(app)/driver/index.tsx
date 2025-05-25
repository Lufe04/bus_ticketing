import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import UserMenuModal from '../../../components/UserModal';
import { useBoarding } from '../../../context/BoardingContext';
import { Timestamp } from 'firebase/firestore';
import { useUser } from '../../../context/UserContext';

export default function DriverHomeScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const { boardings, getCurrentBoarding } = useBoarding();
  const { userData } = useUser();

  const nombreUsuario = userData?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();


  const currentBoarding = getCurrentBoarding();
  const nextBoardings = boardings.filter(b =>
    b.estado === 'programado' &&
    b.id !== currentBoarding?.id &&
    b.hora_inicio?.seconds > (currentBoarding?.hora_inicio?.seconds || 0)
  )
  .sort((a, b) => a.hora_inicio.seconds - b.hora_inicio.seconds)
  .slice(0, 5);

  const formatTime = (timestamp?: Timestamp) => {
    if (!timestamp?.toDate) return '—';
    const date = timestamp.toDate();
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDateLabel = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    if (isToday) {
      return `Hoy, ${time}`;
    } else {
      const fecha = date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
      });
      return `${fecha}, ${time}`;
    }
  };

  const isWithinBoardingWindow = (timestamp: Timestamp) => {
    const now = new Date();
    const target = timestamp.toDate();

    const oneHourBefore = new Date(target.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(target.getTime() + 60 * 60 * 1000);

    return now >= oneHourBefore && now <= oneHourAfter;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hola, {nombreUsuario}</Text>
          <Text style={styles.headerSubtitle}>¿Listo para tu próximo viaje?</Text>
        </View>
        <TouchableOpacity style={styles.userCircle} onPress={() => setMenuVisible(true)}>
          <Text style={styles.userInitial}>{inicial}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {currentBoarding && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tu próxima ruta</Text>
            <View style={styles.routeRow}>
              <Text style={styles.routeCity}>{currentBoarding.desde}</Text>
              <MaterialIcons name="east" size={21} color="#000" />
              <Text style={styles.routeCity}>{currentBoarding.hasta}</Text>
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.group}>
                <MaterialCommunityIcons name="timer-outline" size={20} color="#989898" />
                <Text style={styles.routeText}>{formatTime(currentBoarding.hora_inicio)}</Text>
              </View>
              <View style={styles.group}>
                <MaterialCommunityIcons name="timer-off-outline" size={20} color="#989898" />
                <Text style={styles.routeText}>{formatTime(currentBoarding.hora_fin)}</Text>
              </View>
              <View style={styles.group}>
                <MaterialIcons name="person-outline" size={20} color="#989898" />
                <Text style={styles.routeText}>{currentBoarding.pasajeros ?? 0} Pasajeros</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.startButton, !isWithinBoardingWindow(currentBoarding.hora_inicio) && { backgroundColor: '#ccc' }]}
              onPress={() => router.navigate('/driver/route')}
              //disabled={!isWithinBoardingWindow(currentBoarding.hora_inicio)}
            >
              <Text style={styles.startButtonText}>Iniciar Ruta</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle2}>Tus próximas rutas</Text>

        {nextBoardings.map((item, idx) => (
          <View key={idx} style={styles.routeBoxInactive}>
            <View style={styles.routeBoxRow}>
              <MaterialCommunityIcons name="timer-outline" size={24} color="rgba(50, 50, 50, 0.8)" />
              <Text style={styles.routeTimeInactive}>
                {formatDateLabel(item.hora_inicio)} - {formatTime(item.hora_fin)}
              </Text>
            </View>
            <View style={styles.routeBoxRow}>
              <MaterialIcons name="date-range" size={24} color="rgba(50, 50, 50, 0.8)" />
              <Text style={styles.routeTextRow}>{item.desde}</Text>
              <MaterialIcons name="east" size={20} color="rgba(50, 50, 50, 0.8)" style={{ marginLeft: 10 }} />
              <Text style={styles.routeTextRow}>{item.hasta}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.navbar}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="text-box-outline" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver/routes')} />
          <Text style={styles.navLabel}>Mis Rutas</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home-outline" size={40} style={styles.navbarIconActive} />
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
    backgroundColor: '#F7F8FA' 
  },
  header: { 
    backgroundColor: '#08173B', 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontSize: 25, 
    fontWeight: '600' 
  },
  headerSubtitle: { 
    color: '#FFFFFF', 
    fontSize: 19, 
    fontWeight: '400' 
  },
  userCircle: { 
    backgroundColor: '#FFFFFF', 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  userInitial: { 
    color: '#08173B', 
    fontWeight: '500', 
    fontSize: 32 
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    margin: 16, 
    padding: 16, 
    borderRadius: 24, 
    borderColor: '#D9D9D9', 
    borderWidth: 1 
  },
  sectionTitle: { 
    fontWeight: '600', 
    fontSize: 16, 
    marginBottom: 10, 
    color: '#000000' 
  },
  sectionTitle2: { 
    fontWeight: '600', 
    fontSize: 20, 
    marginHorizontal: 16, 
    marginTop: 6, 
    marginBottom: 20, 
    color: '#000000' 
  },
  routeRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    marginBottom: 10, 
    gap: 10 
  },
  routeCity: { 
    fontSize: 18, 
    fontWeight: '600' 
  },
  routeDetails: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 30, 
    marginBottom: 0 
  },
  group: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5, 
    marginBottom: 14 
  },
  routeText: { 
    fontSize: 15, 
    color: '#989898', 
    marginHorizontal: 4 
  },
  startButton: {
    backgroundColor: '#20ADF5', 
    paddingVertical: 8, 
    borderRadius: 15, 
    alignItems: 'center',
    shadowColor: '#000000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.25,
    shadowRadius: 4, 
    elevation: 4
  },
  startButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 18 
  },
  routeBoxInactive: {
    backgroundColor: 'rgba(152, 152, 152, 0.2)', 
    marginHorizontal: 16, 
    padding: 16,
    borderRadius: 24, 
    marginBottom: 12, 
    borderWidth: 0.5, 
    borderColor: 'rgba(50, 50, 50, 0.8)'
  },
  routeBoxRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  routeTimeInactive: { 
    fontSize: 15, 
    color: 'rgba(50, 50, 50, 0.8)', 
    fontWeight: '400', 
    marginLeft: 8 
  },
  routeTextRow: { 
    fontSize: 15, 
    fontWeight: '400', 
    color: 'rgba(50, 50, 50, 0.8)', 
    marginLeft: 8 
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
    borderColor: '#E5E7EB'
  },
  navItem: { 
    alignItems: 'center' 
  },
  navbarIcon: { 
    color: '#000000' 
  },
  navbarIconActive: { 
    color: '#20ADF5' 
  },
  navLabel: { 
    fontSize: 12, 
    color: '#000', 
    marginTop: 2 
  },
  navLabelActive: { 
    fontSize: 12, 
    color: '#20ADF5', 
    marginTop: 2, 
    fontWeight: '600' 
  }
});
