import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBoarding } from '../../../context/BoardingContext'; // Ajusta la ruta si es necesario
import { Boarding } from '../../../context/BoardingContext';

// Paleta de colores (misma que en index)
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

export default function SelectScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { searchBoardings, loading } = useBoarding();
  
  // Estado para almacenar los resultados de la búsqueda
  const [results, setResults] = useState<Boarding[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Obtener y formatear los parámetros de búsqueda
  const from = params.from as string || 'CSA';
  const fromDetails = params.fromDetails as string || 'Ciudad desconocida';
  const to = params.to as string || 'CSA';
  const toDetails = params.toDetails as string || 'Ciudad desconocida';
  const dateString = params.date as string || new Date().toISOString();
  const passengers = parseInt(params.passengers as string || '1');
  const date = new Date(dateString);

  // Formatear la fecha para mostrarla en el resumen
  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Cargar los resultados de búsqueda
  useEffect(() => {
    const loadResults = async () => {
      try {
        const boardings = await searchBoardings(from, to, date);
        setResults(boardings);
        
        if (boardings.length === 0) {
          setError('No se encontraron viajes disponibles para los criterios seleccionados.');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error al cargar resultados:', err);
        setError('Error al buscar viajes. Por favor intente nuevamente.');
      }
    };
    
    loadResults();
  }, [from, to, dateString]);

  // Manejador para comprar un pasaje
  const handleBuyTicket = (boarding: Boarding) => {
    // Aquí puedes navegar a la pantalla de compra o reserva
    router.push({
      pathname: '/client/ticketScreen',
      params: { 
        boardingId: boarding.id,
        passengers: String(passengers)
      }
    });
  };

  // Formatear la hora a partir de un Timestamp
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '--:--';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Volver a la pantalla anterior
  const goBack = () => {
    router.back();
  };

  // Render de cada item de viaje
  const renderBoardingItem = ({ item }: { item: Boarding }) => {
    const startTime = formatTime(item.hora_inicio);
    const endTime = formatTime(item.hora_fin);
    const availableSeats = item.pasajeros - (item.pasajeros_lista?.length || 0);
    
    return (
      <View style={styles.boardingCard}>
        <View style={styles.boardingRouteContainer}>
          <Text style={styles.boardingRoute}>{from} → {to}</Text>
        </View>
        
        <View style={styles.boardingDetails}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={18} color={COLORS.iconGray} />
            <Text style={styles.timeText}>{startTime}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Ionicons name="flag-outline" size={18} color={COLORS.iconGray} />
            <Text style={styles.timeText}>{endTime}</Text>
          </View>
          
          <View style={styles.seatsContainer}>
            <Ionicons name="people-outline" size={18} color={COLORS.iconGray} />
            <Text style={styles.seatsText}>{availableSeats} asientos libres</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => handleBuyTicket(item)}
        >
          <Text style={styles.buyButtonText}>Comprar pasaje</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar viaje</Text>
        <View style={{ width: 24 }} /> {/* Espaciador para centrar el título */}
      </View>
      
      {/* Resumen de búsqueda */}
      <View style={styles.searchSummary}>
        <Text style={styles.routeText}>
          {from} → {to}
        </Text>
        <View style={styles.summaryDetails}>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
            <Text style={styles.summaryText}>{formattedDate}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Ionicons name="person-outline" size={16} color={COLORS.white} />
            <Text style={styles.summaryText}>
              {passengers} {passengers === 1 ? 'pasajero' : 'pasajeros'}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.skyBlue} />
            <Text style={styles.loadingText}>Buscando viajes disponibles...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.gray} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={goBack}>
              <Text style={styles.retryButtonText}>Cambiar búsqueda</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={renderBoardingItem}
            keyExtractor={item => item.id || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 0,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchSummary: {
    padding: 16,
    paddingBottom: 20,
  },
  routeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  summaryDetails: {
    flexDirection: 'row',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.white,
    marginLeft: 6,
  },
  mainContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  boardingCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  boardingRouteContainer: {
    marginBottom: 12,
  },
  boardingRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  boardingDetails: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primaryBlue,
    marginLeft: 6,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatsText: {
    fontSize: 16,
    color: COLORS.primaryBlue,
    marginLeft: 6,
  },
  buyButton: {
    backgroundColor: COLORS.skyBlue,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});