import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';

// Paleta de colores
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  iconGray: '#666666',
  overlay: 'rgba(0,0,0,0.7)',
};

export default function ClientHome() {
  const { currentUser } = useAuth();
  const { userData, isLoading: isUserDataLoading } = useUser();
  const router = useRouter();
  
  // Estados para el formulario de búsqueda
  const [from, setFrom] = useState('CSA');
  const [fromDetails, setFromDetails] = useState('Ciudad, Estación o Aeropuerto');
  const [to, setTo] = useState('CSA');
  const [toDetails, setToDetails] = useState('Ciudad, Estación o Aeropuerto');
  const [departureDate, setDepartureDate] = useState('28 abr 2025');
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  
  // Función para intercambiar origen y destino
  const swapLocations = () => {
    const tempFrom = from;
    const tempFromDetails = fromDetails;
    
    setFrom(to);
    setFromDetails(toDetails);
    setTo(tempFrom);
    setToDetails(tempFromDetails);
  };

  // Mostrar selectores de fecha
  const showDatePicker = (type: 'departure' | 'return') => {
    Alert.alert(
      'Seleccionar fecha',
      `Esta funcionalidad permitiría elegir la fecha de ${type === 'departure' ? 'salida' : 'regreso'}.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  // Navegación a otras pantallas
  const navigateToSearch = () => {
    router.push('/client/selectScreen');
  };

  const navigateToTickets = () => {
    router.push('/client/ticketScreen');
  };

  // Obtener el nombre del usuario
  const userName = userData?.nombre || 'Usuario';
  // Primera letra del usuario para el avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  // Modal del QR
  const renderQrModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Código QR del Tiquete</Text>
              <TouchableOpacity onPress={() => setQrModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.primaryBlue} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.qrCodeLarge}>
                <Ionicons name="qr-code" size={180} color={COLORS.primaryBlue} />
              </View>
              
              <Text style={styles.qrInfoText}>
                Montería → Sincelejo
              </Text>
              <Text style={styles.qrDetailsText}>
                28 Abr 2025 | 6:00 a.m. | Asiento 1
              </Text>
              
              <Text style={styles.qrInstructions}>
                Muestra este código al abordar el bus
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Mostrar pantalla de carga mientras se obtienen los datos del usuario
  if (isUserDataLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.loadingContainer]}>
          <ActivityIndicator size="large" color={COLORS.skyBlue} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si no hay datos de usuario, mostrar mensaje
  if (!userData && !isUserDataLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.loadingContainer]}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace('/client')}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.subGreeting}>¿Listo para tu próximo viaje?</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </View>
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Formulario de búsqueda */}
        <View style={styles.section}>
          {/* Origen y destino */}
          <View style={styles.locationRow}>
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>Desde</Text>
              <TextInput
                style={styles.locationInput}
                value={from}
                onChangeText={setFrom}
                placeholder="CSA"
              />
              <TextInput
                style={styles.locationDetailsInput}
                value={fromDetails}
                onChangeText={setFromDetails}
                placeholder="Ciudad, Estación o Aeropuerto"
              />
            </View>
            
            <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
              <Ionicons name="swap-horizontal" size={20} color={COLORS.primaryBlue} />
            </TouchableOpacity>
            
            <View style={styles.locationField}>
              <Text style={styles.fieldLabel}>Hasta</Text>
              <TextInput
                style={styles.locationInput}
                value={to}
                onChangeText={setTo}
                placeholder="CSA"
              />
              <TextInput
                style={styles.locationDetailsInput}
                value={toDetails}
                onChangeText={setToDetails}
                placeholder="Ciudad, Estación o Aeropuerto"
              />
            </View>
          </View>
          
          {/* Resto del contenido... */}
          
          {/* Fechas */}
          <View style={styles.datesRow}>
            <TouchableOpacity 
              style={styles.dateField} 
              onPress={() => showDatePicker('departure')}
            >
              <Text style={styles.fieldLabel}>Fecha de salida</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                <Text style={styles.dateText}>{departureDate}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateField, { marginRight: 0 }]} 
              onPress={() => showDatePicker('return')}
            >
              <Text style={styles.fieldLabel}>Fecha de regreso</Text>
              <View style={styles.dateContent}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                <Text style={styles.dateText}>
                  {returnDate || 'Opcional'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Pasajeros */}
          <View style={styles.passengersContainer}>
            <View style={styles.passengersContent}>
              <Text style={styles.fieldLabel}>Pasajeros</Text>
              <View style={styles.passengerInputContainer}>
                <Ionicons name="people-outline" size={18} color={COLORS.gray} />
                <TextInput
                  style={styles.passengerInput}
                  value={String(passengerCount)}
                  onChangeText={(text) => {
                    const num = parseInt(text.replace(/[^0-9]/g, ''));
                    setPassengerCount(isNaN(num) ? 1 : num);
                  }}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.passengerLabel}>
                  {passengerCount === 1 ? 'Pasajero' : 'Pasajeros'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Botón de búsqueda */}
          <TouchableOpacity style={styles.searchButton} onPress={navigateToSearch}>
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Sección de tus tiquetes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Tiquetes</Text>
            <TouchableOpacity onPress={navigateToTickets}>
              <Ionicons name="arrow-forward" size={24} color={COLORS.primaryBlue} />
            </TouchableOpacity>
          </View>
          
          {/* Tiquete (no clickeable) */}
          <View style={styles.ticketCard}>
            <View style={styles.ticketContent}>
              <View style={styles.ticketRow}>
                <View style={styles.ticketIcon}>
                  <Ionicons name="bus-outline" size={18} color={COLORS.iconGray} />
                </View>
                <Text style={styles.routeText}>Montería → Sincelejo</Text>
              </View>
              
              <View style={styles.ticketDetailsRow}>
                <View style={styles.ticketDetailItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.iconGray} />
                  <Text style={styles.ticketDetailText}>28 Abr 2025</Text>
                </View>
                
                <View style={styles.ticketDetailItem}>
                  <Ionicons name="person-outline" size={16} color={COLORS.iconGray} />
                  <Text style={styles.ticketDetailText}>1 Asiento</Text>
                </View>
                
                <View style={styles.ticketDetailItem}>
                  <Ionicons name="time-outline" size={16} color={COLORS.iconGray} />
                  <Text style={styles.ticketDetailText}>6:00 a.m.</Text>
                </View>
              </View>
            </View>
            
            {/* Solo el QR es clickeable */}
            <TouchableOpacity 
              style={styles.qrContainer}
              onPress={() => setQrModalVisible(true)}
            >
              <View style={styles.qrCode}>
                <Ionicons name="qr-code-outline" size={36} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Modal del código QR */}
      {renderQrModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  scrollContent: {
    paddingBottom: 80, // Espacio para el tab navigator
  },
  // El resto de estilos se mantienen igual...
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationField: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  locationInput: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryBlue,
    padding: 0,
  },
  locationDetailsInput: {
    fontSize: 12,
    color: COLORS.gray,
    padding: 0,
    marginTop: 2,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateField: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
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
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  passengersContent: {
    flex: 1,
  },
  passengerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerInput: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginLeft: 8,
    padding: 0,
    minWidth: 30,
  },
  passengerLabel: {
    fontSize: 16,
    color: COLORS.primaryBlue,
    marginLeft: 4,
  },
  searchButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  ticketCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  ticketContent: {
    flex: 1,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIcon: {
    marginRight: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  ticketDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ticketDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  ticketDetailText: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 6,
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    padding: 8,
  },
  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  modalContent: {
    alignItems: 'center',
  },
  qrCodeLarge: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrInfoText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginBottom: 8,
  },
  qrDetailsText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 20,
  },
  qrInstructions: {
    fontSize: 16,
    color: COLORS.primaryBlue,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 10,
  }
});