import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { useRoutes } from '../../../context/RoutesContext'; // Importar el contexto de rutas

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
  const { currentUser, logout } = useAuth();
  const { userData, isLoading: isUserDataLoading } = useUser();
  const { userRoutes, getUserRoutes, loading: routesLoading } = useRoutes(); // Usar el contexto de rutas
  const router = useRouter();
  
  // Estados para el formulario de búsqueda
  const [from, setFrom] = useState('');
  const [fromDetails, setFromDetails] = useState('Ciudad, Estación o Aeropuerto');
  const [to, setTo] = useState('');
  const [toDetails, setToDetails] = useState('Ciudad, Estación o Aeropuerto');
  const [departureDate, setDepartureDate] = useState('28 abr 2025');
  const [passengerCount, setPassengerCount] = useState(1);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [departureDateObj, setDepartureDateObj] = useState(new Date(2025, 3, 28));
  
  // Estado para almacenar el último ticket comprado
  const [lastTicket, setLastTicket] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Cargar los tickets del usuario cuando se monta el componente
  useEffect(() => {
    const loadUserTickets = async () => {
      if (userData?.id) {
        try {
          await getUserRoutes();
        } catch (error) {
          console.error('Error cargando tickets del usuario:', error);
        }
      }
    };
    
    loadUserTickets();
  }, [userData?.id, getUserRoutes]);
  
  // Actualizar el último ticket cuando cambien las rutas del usuario
  useEffect(() => {
    if (userRoutes && userRoutes.length > 0) {
      // Ordenar por fecha de creación (más reciente primero)
      const sortedRoutes = [...userRoutes].sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Orden descendente
      });
      
      // Obtener el ticket más reciente
      setLastTicket(sortedRoutes[0]);
    } else {
      setLastTicket(null);
    }
  }, [userRoutes]);

  // Función para intercambiar origen y destino
  const swapLocations = () => {
    const tempFrom = from;
    const tempFromDetails = fromDetails;
    
    setFrom(to);
    setFromDetails(toDetails);
    setTo(tempFrom);
    setToDetails(tempFromDetails);
  };

  // Nueva función para abrir el modal de fecha
  const handleOpenDatePicker = () => {
    setDatePickerModalVisible(true);
    console.log("Abriendo selector de fecha...");
  };

  // Función para seleccionar una fecha en el calendario personalizado
  const handleSelectDate = (date: Date) => {
    setDepartureDateObj(date);
    
    // Formatear la fecha para mostrarla
    const day = date.getDate();
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    setDepartureDate(`${day} ${month} ${year}`);
    setDatePickerModalVisible(false);
    console.log(`Fecha seleccionada: ${day} ${month} ${year}`);
  };

  const navigateToSearch = () => {
    // Asegurar que tenemos un objeto Date válido
    // Enviamos la fecha como string ISO, pero sin tiempo
    const dateObj = departureDateObj;
    dateObj.setHours(0, 0, 0, 0); // Resetear la hora a medianoche
    
    // Parámetros de búsqueda para enviar
    const searchParams = {
      from: from,
      fromDetails: fromDetails,
      to: to,
      toDetails: toDetails,
      date: dateObj.toISOString(), // Formato ISO sin tiempo
      passengers: passengerCount.toString()
    };
    
    // Navegar a la pantalla de selección con los parámetros
    router.push({
      pathname: '/client/selectScreen',
      params: searchParams
    });
  };

  // Funciones de navegación y logout
  const navigateToTickets = () => {
    router.push('/client/ticketScreen');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth');
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };
  
  // Función para abrir el QR de un ticket específico
  const handleOpenQR = (ticket: any) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  // Obtener el nombre del usuario
  const userName = userData?.nombre || 'Usuario';
  // Primera letra del usuario para el avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  // Modal del QR - ahora muestra los detalles del ticket seleccionado
  const renderQrModal = () => {
    if (!selectedTicket) return null;
    
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
                {selectedTicket.desde} → {selectedTicket.hasta}
              </Text>
              <Text style={styles.qrDetailsText}>
                {selectedTicket.fecha_salida} | {selectedTicket.hora} | Asiento {selectedTicket.asiento}
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

  // Modal del perfil - sin cambios
  const renderProfilePopup = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={profilePopupVisible}
        onRequestClose={() => setProfilePopupVisible(false)}
      >
        <TouchableOpacity 
          style={styles.profilePopupOverlay}
          activeOpacity={1}
          onPress={() => setProfilePopupVisible(false)}
        >
          <View style={styles.profilePopup}>
            <View style={styles.profilePopupHeader}>
              <View style={styles.profileAvatarSmall}>
                <Text style={styles.profileAvatarText}>{userInitial}</Text>
              </View>
              <View style={styles.profilePopupInfo}>
                <Text style={styles.profilePopupName}>{userName}</Text>
                <Text style={styles.profilePopupEmail}>{userData?.correo || 'correo@ejemplo.com'}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Componente del selector de fecha personalizado
  const renderDatePickerModal = () => {
    // Crear un array de fechas para 30 días desde hoy
    const today = new Date();
    const dateOptions = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={datePickerModalVisible}
        onRequestClose={() => setDatePickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { width: '90%', maxHeight: 400 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar fecha</Text>
              <TouchableOpacity onPress={() => setDatePickerModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.primaryBlue} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={dateOptions}
              keyExtractor={(item) => item.toISOString()}
              renderItem={({ item }) => {
                // Formatear la fecha para mostrarla
                const day = item.getDate();
                const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][item.getDay()];
                const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                const month = monthNames[item.getMonth()];
                const year = item.getFullYear();
                const isToday = day === today.getDate() && 
                                item.getMonth() === today.getMonth() && 
                                item.getFullYear() === today.getFullYear();
                
                return (
                  <TouchableOpacity 
                    style={[
                      styles.dateOption,
                      isToday && styles.todayOption
                    ]}
                    onPress={() => handleSelectDate(item)}
                  >
                    <View style={styles.dateOptionContent}>
                      <Text style={styles.dayName}>{dayName}</Text>
                      <Text style={styles.dateOptionDay}>{day}</Text>
                    </View>
                    <Text style={styles.dateOptionMonth}>{`${month} ${year}`}</Text>
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Mostrar pantalla de carga mientras se obtienen los datos del usuario
  if (isUserDataLoading || routesLoading) {
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header con fondo azul */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {userName}</Text>
          <Text style={styles.subGreeting}>¿Listo para tu próximo viaje?</Text>
        </View>
        {/* Hacer el avatar clickeable */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => setProfilePopupVisible(true)}
        >
          <Text style={styles.avatarText}>{userInitial}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenido principal con fondo blanco y bordes redondeados */}
      <View style={styles.mainContent}>
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
            
            {/* Nueva fila para fecha y pasajeros */}
            <View style={styles.datesRow}>
              {/* Fecha de salida */}
              <TouchableOpacity 
                style={styles.dateField} 
                onPress={handleOpenDatePicker}
                activeOpacity={0.7}
              >
                <Text style={styles.fieldLabel}>Fecha de salida</Text>
                <View style={styles.dateContent}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
                  <Text style={styles.dateText}>{departureDate}</Text>
                </View>
              </TouchableOpacity>
              
              {/* Pasajeros */}
              <View style={styles.passengerField}>
                <Text style={styles.fieldLabel}>Pasajeros</Text>
                <View style={styles.passengerInputContainer}>
                  <Ionicons name="people-outline" size={18} color={COLORS.gray} />
                  <TextInput
                    style={styles.passengerInput}
                    value={String(passengerCount)}
                    onChangeText={(text) => {
                      const num = parseInt(text.replace(/[^0-9]/g, ''));
                      setPassengerCount(isNaN(num) ? 1 : Math.max(1, Math.min(num, 99)));
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
            
            {lastTicket ? (
              // Mostrar el último ticket comprado
              <View style={styles.ticketCard}>
                <View style={styles.ticketContent}>
                  <View style={styles.ticketRow}>
                    <View style={styles.ticketIcon}>
                      <Ionicons name="bus-outline" size={18} color={COLORS.iconGray} />
                    </View>
                    <Text style={styles.routeText}>{lastTicket.desde} → {lastTicket.hasta}</Text>
                  </View>
                  
                  <View style={styles.ticketDetailsRow}>
                    <View style={styles.ticketDetailItem}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.iconGray} />
                      <Text style={styles.ticketDetailText}>{lastTicket.fecha_salida}</Text>
                    </View>
                    
                    <View style={styles.ticketDetailItem}>
                      <Ionicons name="person-outline" size={16} color={COLORS.iconGray} />
                      <Text style={styles.ticketDetailText}>{lastTicket.asiento} Asiento</Text>
                    </View>
                    
                    <View style={styles.ticketDetailItem}>
                      <Ionicons name="time-outline" size={16} color={COLORS.iconGray} />
                      <Text style={styles.ticketDetailText}>{lastTicket.hora || '6:00 a.m.'}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Solo el QR es clickeable */}
                <TouchableOpacity 
                  style={styles.qrContainer}
                  onPress={() => handleOpenQR(lastTicket)}
                  disabled={lastTicket.estado !== 'activo'}
                >
                  <View style={[
                    styles.qrCode,
                    { backgroundColor: lastTicket.estado === 'activo' ? COLORS.green : COLORS.gray }
                  ]}>
                    <Ionicons name="qr-code-outline" size={36} color={COLORS.white} />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              // Mostrar mensaje si no hay tickets
              <View style={styles.emptyTicketsContainer}>
                <Ionicons name="ticket-outline" size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyTicketsText}>No tienes tiquetes comprados</Text>
                <TouchableOpacity 
                  style={styles.bookNowButton}
                  onPress={navigateToSearch}
                >
                  <Text style={styles.bookNowButtonText}>Reservar ahora</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Modals */}
        {renderQrModal()}
        {renderProfilePopup()}
        {renderDatePickerModal()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... Mantener todos los estilos existentes

  // Añadir nuevos estilos para el mensaje de tickets vacíos
  emptyTicketsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  emptyTicketsText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 10,
    marginBottom: 20,
  },
  bookNowButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  bookNowButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  // Resto de los estilos existentes
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
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
    paddingTop: Platform.OS === 'android' ? 50 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    marginTop: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  scrollContent: {
    paddingBottom: 80, 
  },
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
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  locationInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    padding: 0,
    marginVertical: 2,
  },
  locationDetailsInput: {
    fontSize: 12,
    color: COLORS.gray,
    padding: 0,
  },
  swapButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dateField: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    height: 70,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  passengerField: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    height: 70,
  },
  passengerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
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
  dateOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayOption: {
    backgroundColor: COLORS.lightGray,
  },
  dateOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 14,
    color: COLORS.gray,
    width: 40,
  },
  dateOptionDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginLeft: 8,
    width: 30,
  },
  dateOptionMonth: {
    fontSize: 14,
    color: COLORS.gray,
  },
  searchButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: COLORS.lightGray,
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
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  },
  profilePopupOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  profilePopup: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 100,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profilePopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  profileAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profilePopupInfo: {
    flex: 1,
  },
  profilePopupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  profilePopupEmail: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.skyBlue,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});