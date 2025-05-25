import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
import { useRoutes } from '../../../context/RoutesContext'; // Importar el contexto de rutas
import { db } from '../../../utils/FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

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

// Interfaz para los tickets (usando la estructura de ClientRoute)
interface Ticket {
  id: string;
  desde: string;
  hasta: string;
  fecha_salida: string;
  hora: string;
  asiento: string;
  estado: 'activo' | 'inactivo';
  escaneado: boolean;
  viaje_id?: string;
}

export default function TicketScreen() {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUser();
  const { userRoutes, loading: routesLoading, getUserRoutes } = useRoutes(); // Usar el contexto de rutas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Cargar los tickets del usuario actual
  useEffect(() => {
    const loadTickets = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Obtener tickets usando el contexto
        await getUserRoutes();
      } catch (err) {
        console.error('Error cargando tickets:', err);
        setError('No se pudieron cargar tus tickets');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [userData?.id, getUserRoutes]);

  // Abrir modal de QR
  const handleOpenQR = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setQrModalVisible(true);
  };

  // Volver a la pantalla anterior
  const handleGoBack = () => {
    router.back();
  };

  // Componente para renderizar un ticket
  const TicketItem = ({ ticket }: { ticket: Ticket }) => {
    const isActive = ticket.estado === 'activo';
    
    return (
      <View style={[
        styles.ticketCard,
        isActive ? {} : { opacity: 0.7 }
      ]}>
        <View style={styles.ticketContent}>
          <View style={styles.ticketRow}>
            <Ionicons name="bus-outline" size={20} color={COLORS.iconGray} style={styles.ticketIcon} />
            <Text style={styles.routeText}>{ticket.desde} → {ticket.hasta}</Text>
          </View>
          
          <View style={styles.ticketDetailsRow}>
            <View style={styles.ticketDetailItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.iconGray} />
              <Text style={styles.ticketDetailText}>{ticket.fecha_salida}</Text>
            </View>
            
            <View style={styles.ticketDetailItem}>
              <Ionicons name="person-outline" size={16} color={COLORS.iconGray} />
              <Text style={styles.ticketDetailText}>{ticket.asiento} Asiento</Text>
            </View>
            
            <View style={styles.ticketDetailItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.iconGray} />
              <Text style={styles.ticketDetailText}>{ticket.hora}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.qrContainer}
          onPress={() => handleOpenQR(ticket)}
          activeOpacity={0.8}
          disabled={!isActive}
        >
          <View style={[
            styles.qrCode,
            isActive ? { backgroundColor: COLORS.green } : { backgroundColor: COLORS.gray }
          ]}>
            <Ionicons name="qr-code-outline" size={36} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Modal para mostrar QR
  const renderQRModal = () => {
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

  // Si está cargando los datos del usuario o los tickets
  if (userLoading || routesLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.skyBlue} />
          <Text style={styles.loadingText}>Cargando tus tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si hay un error al cargar los tickets
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.replace('/client/ticketScreen')}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Separar tickets activos e inactivos usando userRoutes del contexto
  const activeTickets = userRoutes.filter(ticket => ticket.estado === 'activo');
  const inactiveTickets = userRoutes.filter(ticket => ticket.estado === 'inactivo');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus Tiquetes</Text>
        <View style={styles.userAvatarContainer}>
          <Text style={styles.userAvatarText}>
            {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      </View>
      
      {/* Contenido principal */}
      <View style={styles.mainContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Sección de tickets activos */}
          <Text style={styles.sectionTitle}>Activos</Text>
          <View style={styles.divider} />
          
          {activeTickets.length > 0 ? (
            activeTickets.map(ticket => (
              <TicketItem key={ticket.id} ticket={ticket as Ticket} />
            ))
          ) : (
            <Text style={styles.emptyMessage}>No tienes tickets activos</Text>
          )}
          
          {/* Sección de tickets inactivos */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Inactivos</Text>
          <View style={styles.divider} />
          
          {inactiveTickets.length > 0 ? (
            inactiveTickets.map(ticket => (
              <TicketItem key={ticket.id} ticket={ticket as Ticket} />
            ))
          ) : (
            <Text style={styles.emptyMessage}>No tienes tickets inactivos</Text>
          )}
        </ScrollView>
      </View>
      
      {/* Modal del QR */}
      {renderQRModal()}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
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
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginVertical: 20,
  },
  ticketCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para el modal QR
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
});