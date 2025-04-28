import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// Paleta de colores actualizada
const COLORS = {
  primaryBlue: '#131A2E', // Nuevo color azul solicitado
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  yellow: '#FFC107', // Para el rating
};

const transportOptions: { id: string; icon: 'bus-outline' | 'train-outline' | 'car-outline' | 'airplane-outline' | 'boat-outline'; label: string }[] = [
  { id: 'bus', icon: 'bus-outline', label: 'Bus' },
  { id: 'train', icon: 'train-outline', label: 'Train' },
  { id: 'car', icon: 'car-outline', label: 'Car' },
  { id: 'airplane', icon: 'airplane-outline', label: 'Airplane' },
  { id: 'boat', icon: 'boat-outline', label: 'Boat' },
];

export default function ClientHome() {
  const { userData, logout } = useAuth();
  const router = useRouter();

  // Estados para el formulario de búsqueda
  const [selectedTransport, setSelectedTransport] = useState('bus');
  const [fromLocation, setFromLocation] = useState({ code: 'CSA', name: 'City, Station or Airport' });
  const [toLocation, setToLocation] = useState({ code: 'CSA', name: 'City, Station or Airport' });
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [passengerCount, setPassengerCount] = useState(1);

  // Función para intercambiar origen y destino
  const swapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  // Formatear fechas para la visualización
  const formatDate = (date: Date | null) => {
    if (!date) return 'Optional';
    const options = { day: '2-digit' as const, month: 'short' as const, year: 'numeric' as const };
    return date.toLocaleDateString('es-ES', options);
  };

  // Manejadores para los date pickers
  const onDepartureDateChange = (event: any, selectedDate?: Date) => {
    setShowDeparturePicker(false);
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  const onReturnDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowReturnPicker(false);
    if (selectedDate) {
      setReturnDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con ubicación y notificaciones */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={18} color={COLORS.primaryBlue} />
              <Text style={styles.locationText}>Chicago, USA</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primaryBlue} />
          </TouchableOpacity>
        </View>
        
        {/* Opciones de transporte */}
        <View style={styles.transportContainer}>
          {transportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.transportOption,
                selectedTransport === option.id && { backgroundColor: COLORS.skyBlue }
              ]}
              onPress={() => setSelectedTransport(option.id)}
            >
              <Ionicons 
                name={option.icon} 
                size={24} 
                color={selectedTransport === option.id ? COLORS.white : COLORS.primaryBlue} 
              />
              <Text 
                style={[
                  styles.transportLabel,
                  selectedTransport === option.id && { color: COLORS.white }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Formulario de búsqueda */}
        <View style={styles.searchForm}>
          {/* Origen y destino */}
          <View style={styles.locationRow}>
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>From</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.locationCode}>{fromLocation.code}</Text>
                <Text style={styles.locationName}>{fromLocation.name}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.primaryBlue} />
            </TouchableOpacity>
            
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>To</Text>
              <View style={styles.fieldContent}>
                <Text style={styles.locationCode}>{toLocation.code}</Text>
                <Text style={styles.locationName}>{toLocation.name}</Text>
              </View>
            </View>
          </View>
          
          {/* Fechas */}
          <View style={styles.datesRow}>
            <TouchableOpacity 
              style={styles.dateField} 
              onPress={() => setShowDeparturePicker(true)}
            >
              <Text style={styles.fieldLabel}>Departing on</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                <Text style={styles.dateText}>
                  {departureDate ? formatDate(departureDate) : 'Select date'}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dateField} 
              onPress={() => setShowReturnPicker(true)}
            >
              <Text style={styles.fieldLabel}>Returning on</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.gray} />
                <Text style={styles.dateText}>
                  {returnDate ? formatDate(returnDate) : 'Optional'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Mostrar pickers de fecha */}
          {showDeparturePicker && (
            <DateTimePicker
              value={departureDate || new Date()}
              mode="date"
              display="default"
              onChange={onDepartureDateChange}
              minimumDate={new Date()}
            />
          )}
          
          {showReturnPicker && (
            <DateTimePicker
              value={returnDate || new Date()}
              mode="date"
              display="default"
              onChange={onReturnDateChange}
              minimumDate={departureDate || new Date()}
            />
          )}
          
          {/* Pasajeros */}
          <View style={styles.passengersContainer}>
            <View>
              <Text style={styles.fieldLabel}>Passengers</Text>
              <View style={styles.passengersContent}>
                <Ionicons name="people-outline" size={16} color={COLORS.gray} />
                <Text style={styles.passengerText}>{passengerCount} Passenger</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={20} color={COLORS.primaryBlue} />
            </TouchableOpacity>
          </View>
          
          {/* Botón de búsqueda */}
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sección de boletos activos */}
        <View style={styles.ticketsSection}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSectionTitle}>Today Active Ticket</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>See More</Text>
            </TouchableOpacity>
          </View>
          
          {/* Card con info del ticket */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketTopRow}>
              <Text style={styles.companyName}>Arriva - Autotrans</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color={COLORS.yellow} />
                <Text style={styles.ratingText}>7.8</Text>
              </View>
            </View>
            
            <View style={styles.journeyContainer}>
              <View style={styles.locationColumn}>
                <Text style={styles.journeyLabel}>ZBT</Text>
                <Text style={styles.journeyTime}>07:00</Text>
              </View>
              
              <View style={styles.journeyLine}>
                <View style={styles.durationContainer}>
                  <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                  <Text style={styles.durationText}>3h 5min</Text>
                </View>
              </View>
              
              <View style={styles.locationColumn}>
                <Text style={styles.journeyLabel}>SBT</Text>
                <Text style={styles.journeyTime}>10:05</Text>
              </View>
            </View>
            
            {/* Barra de acciones del ticket */}
            <View style={styles.ticketActionBar}>
              <TouchableOpacity style={styles.ticketActionButton}>
                <Ionicons name="search-outline" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Search</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.ticketActionButton}>
                <Ionicons name="ticket-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.ticketActionButton}>
                <Ionicons name="list-outline" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginLeft: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transportOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transportLabel: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.primaryBlue,
  },
  searchForm: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  fieldContent: {
    flexDirection: 'column',
  },
  locationCode: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryBlue,
  },
  locationName: {
    fontSize: 12,
    color: COLORS.gray,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primaryBlue,
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  passengersContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primaryBlue,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  ticketsSection: {
    padding: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ticketSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  seeMoreText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: COLORS.primaryBlue,
  },
  journeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  locationColumn: {
    alignItems: 'center',
  },
  journeyLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  journeyTime: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryBlue,
  },
  journeyLine: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginHorizontal: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  ticketActionBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 4,
  },
});