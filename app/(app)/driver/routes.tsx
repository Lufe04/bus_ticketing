import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useBoarding } from '../../../context/BoardingContext';
import { useAuth } from '../../../context/AuthContext';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { es as localeES } from 'date-fns/locale';


// Configuración en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function DriverRoutesScreen() {
  const router = useRouter();
  const { userData } = useAuth();
  const { boardings } = useBoarding();

  const nombreUsuario = userData?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();

  const todayDate = toZonedTime(new Date(), 'America/Bogota');
  const todayStr = format(todayDate, 'yyyy-MM-dd');

  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Fechas marcadas en el calendario
  const markedDates: Record<string, any> = {};

  boardings.forEach(b => {
    const dateKey = format(b.hora_inicio.toDate(), 'yyyy-MM-dd');
    // Si ya estaba marcado por otra ruta, no lo sobrescribimos
    if (!markedDates[dateKey]) {
      markedDates[dateKey] = {
        customStyles: {
          container: {
            backgroundColor: 'rgba(32, 173, 245, 0.2)',
            borderRadius: 50,
          },
          text: {
            color: '#000000',
          }
        }
      };
    }
  });

  // Día seleccionado
  const selectedHasRoutes = boardings.some(b =>
    format(b.hora_inicio.toDate(), 'yyyy-MM-dd') === selectedDate
  );

  if (selectedHasRoutes) {
    // Si tiene rutas: círculo azul + texto blanco
    markedDates[selectedDate] = {
      customStyles: {
        container: {
          backgroundColor: '#20ADF5',
          borderRadius: 50,
        },
        text: {
          color: '#FFFFFF',
        }
      }
    };
  } else {
    // Si NO tiene rutas: solo número azul, sin fondo
    markedDates[selectedDate] = {
      customStyles: {
        text: {
          color: '#20ADF5',
        }
      }
    };
  }

  // Obtener viajes del día seleccionado
  const selectedRoutes = boardings.filter(b => {
    const date = b.hora_inicio.toDate();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const formatted = localDate.toISOString().split('T')[0];
    return formatted === selectedDate;
  });

  // Fecha formateada para el título
  const [year, month, day] = selectedDate.split('-').map(Number);
  const localParsedDate = new Date(year, month - 1, day);

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hola, {nombreUsuario}</Text>
          <Text style={styles.headerSubtitle}>Planifica tu recorrido</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>{inicial}</Text>
        </View>
      </View>

      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        markingType={'custom'}
        theme={{
          backgroundColor: '#F7F8FA',
          calendarBackground: '#F7F8FA',
          selectedDayTextColor: '#000000',
          textSectionTitleColor: '#000000',
          todayTextColor: '#20ADF5',
          dayTextColor: '#000000',
          textDisabledColor: '#989898',
          arrowColor: '#000000',
          monthTextColor: '#000000',
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 16,
          textMonthFontWeight: '500',
          textDayFontWeight: '400',
        }}
        firstDay={1}
        style={{
          marginHorizontal: 16,
          borderRadius: 16,
          elevation: 2,
          paddingBottom: 10,
        }}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>
        <Text style={styles.sectionTitle}>Tus próximas rutas</Text>
        <Text style={styles.dateText}>
          {localParsedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {selectedRoutes.map((route, idx) => (
          <View key={idx} style={styles.routeCard}>
            <MaterialIcons name="date-range" size={24} color='rgba(50, 50, 50, 0.8)' style={{ marginRight: 8 }} />
            <Text style={[styles.routeText, { marginHorizontal: 5 }]}>{route.desde}</Text>
            <MaterialIcons name="east" size={20} color='rgba(50, 50, 50, 0.8)' style={{ marginHorizontal: 10 }} />
            <Text style={styles.routeText}>{route.hasta}</Text>
          </View>
        ))}
        {selectedRoutes.length === 0 && (
          <View style={styles.noRoutesBox}>
            <Text style={styles.noRoutesText}>No hay viajes asignados</Text>
          </View>
        )}
      </ScrollView>

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="text-box-outline" size={40} style={styles.navbarIconActive} />
          <Text style={styles.navLabelActive}>Mis Rutas</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home-outline" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver')} />
          <Text style={styles.navLabel}>Inicio</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="event-available" size={40} style={styles.navbarIcon} onPress={() => router.navigate('/driver/history')} />
          <Text style={styles.navLabel}>Historial</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: {
    backgroundColor: '#08173B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '600' },
  headerSubtitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '400' },
  userCircle: {
    backgroundColor: '#FFFFFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: { color: '#08173B', fontWeight: '500', fontSize: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 12,
    color: '#000',
  },
  routeCard: {
    borderWidth: 0.5,
    borderColor: 'rgba(50, 50, 50, 0.8)',
    borderRadius: 24,
    padding: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(50, 50, 50, 0.8)',
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
  navItem: { alignItems: 'center' },
  navbarIcon: { color: '#000000' },
  navbarIconActive: { color: '#20ADF5' },
  navLabel: { fontSize: 12, color: '#000', marginTop: 2 },
  navLabelActive: { fontSize: 12, color: '#20ADF5', marginTop: 2, fontWeight: '600' },
  noRoutesBox: {
  marginTop: 30,
  alignItems: 'center',
  justifyContent: 'center',
},
noRoutesText: {
  fontSize: 16,
  color: '#989898',
  fontWeight: '400',
},
});
