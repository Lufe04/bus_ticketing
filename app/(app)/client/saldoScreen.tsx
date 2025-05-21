import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

// Paleta de colores consistente con el resto de la aplicación
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
  darkPurple: '#191F30',
};

// Datos de valor de pasajes según duración
const fareData = [
  { duration: '1 h - 2 h', price: 8000 },
  { duration: '2 h - 3 h', price: 16000 },
  { duration: '3 h - 4 h', price: 24000 },
  { duration: '4 h - 5 h', price: 32000 },
  { duration: '5 h - 6 h', price: 40000 },
  { duration: '6 h - 7 h', price: 50000 },
];

export default function SaldoScreen() {
  const { userData, updateUserBalance } = useAuth();
  const router = useRouter();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMovementsModalVisible, setIsMovementsModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(30000);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>('add');
  
  // Actualizar el saldo desde userData cuando cambie
  useEffect(() => {
    if (userData && userData.saldo !== undefined) {
      setCurrentBalance(userData.saldo);
    }
  }, [userData]);

  // Abrir modal de recarga (añadir saldo)
  const openAddModal = () => {
    setOperationType('add');
    setRechargeAmount('');
    setIsModalVisible(true);
  };

  // Abrir modal para ver movimientos o restar saldo
  const openMovementsModal = () => {
    setIsMovementsModalVisible(true);
  };

  // Manejar la operación de saldo (añadir o restar)
  const handleBalanceOperation = async () => {
    // Validar que sea un número válido
    const amount = parseInt(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
      return;
    }
    
    setIsLoading(true);
    try {
      // Si es resta, convertimos a número negativo
      const finalAmount = operationType === 'add' ? amount : -amount;
      
      // Verificar si al restar no queda negativo
      if (operationType === 'subtract' && amount > currentBalance) {
        Alert.alert('Error', 'No tienes saldo suficiente para esta operación');
        setIsLoading(false);
        return;
      }
      
      await updateUserBalance(finalAmount);
      setIsModalVisible(false);
      setRechargeAmount('');
      
      const message = operationType === 'add' 
        ? `Se han recargado $${amount} a tu cuenta` 
        : `Se han descontado $${amount} de tu cuenta`;
        
      Alert.alert('Éxito', message);
    } catch (error) {
      console.error('Error al modificar saldo:', error);
      const errorMessage = operationType === 'add'
        ? 'No se pudo completar la recarga. Inténtalo de nuevo.'
        : 'No se pudo completar la operación. Inténtalo de nuevo.';
        
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el saldo como moneda
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(balance).replace('COP', '$');
  };
  
  // Formatear precio para la tabla
  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString()}`;
  };

  // Obtener el nombre del usuario desde userData
  const userName = userData?.nombre || 'Usuario';
  // Primera letra del usuario para el avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {userName}</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>{formatBalance(currentBalance)}</Text>
        </View>
        
        {/* Buttons Section */}
        <View style={styles.buttonsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openAddModal}
          >
            <Ionicons name="card-outline" size={30} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Recargar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={openMovementsModal}
          >
            <Ionicons name="cash-outline" size={30} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ver saldos y movimientos</Text>
          </TouchableOpacity>
        </View>
        
        {/* Fare Table */}
        <View style={styles.fareTableContainer}>
          <View style={styles.fareTable}>
            <View style={styles.fareHeader}>
              <Ionicons name="bus-outline" size={20} color={COLORS.primaryBlue} />
              <Text style={styles.fareTitle}>Valor pasajes</Text>
            </View>
            
            {fareData.map((item, index) => (
              <View key={index} style={styles.fareRow}>
                <Text style={styles.fareDuration}>Duración: {item.duration}</Text>
                <View style={styles.fareDots} />
                <Text style={styles.farePrice}>{formatPrice(item.price)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Modal de Recarga/Descuento */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {operationType === 'add' ? 'Ingrese el valor a recargar' : 'Ingrese el valor a descontar'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              keyboardType="numeric"
              value={rechargeAmount}
              onChangeText={setRechargeAmount}
              placeholderTextColor={COLORS.gray}
            />
            
            <TouchableOpacity 
              style={styles.modalActionButton}
              onPress={handleBalanceOperation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.modalActionButtonText}>
                  {operationType === 'add' ? 'Recargar' : 'Descontar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal para Movimientos */}
      <Modal
        visible={isMovementsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMovementsModalVisible(false)}
      >
        <View style={styles.movementsModalContainer}>
          <View style={styles.movementsModalContent}>
            <View style={styles.movementsModalHeader}>
              <Text style={styles.movementsModalTitle}>Saldo y Movimientos</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsMovementsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.currentBalanceSection}>
              <Text style={styles.currentBalanceLabel}>Saldo Actual</Text>
              <Text style={styles.currentBalanceAmount}>{formatBalance(currentBalance)}</Text>
            </View>
            
            <View style={styles.operationsButtons}>
              <TouchableOpacity
                style={[styles.operationButton, styles.addButton]}
                onPress={() => {
                  setIsMovementsModalVisible(false);
                  setTimeout(() => {
                    setOperationType('add');
                    setRechargeAmount('');
                    setIsModalVisible(true);
                  }, 300);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
                <Text style={styles.operationButtonText}>Añadir Saldo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.operationButton, styles.subtractButton]}
                onPress={() => {
                  setIsMovementsModalVisible(false);
                  setTimeout(() => {
                    setOperationType('subtract');
                    setRechargeAmount('');
                    setIsModalVisible(true);
                  }, 300);
                }}
              >
                <Ionicons name="remove-circle-outline" size={24} color={COLORS.white} />
                <Text style={styles.operationButtonText}>Restar Saldo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>Historial de Movimientos</Text>
              
              <View style={styles.emptyHistoryMessage}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.lightGray} />
                <Text style={styles.emptyHistoryText}>No hay movimientos recientes</Text>
              </View>
              
              {/* Aquí se podría implementar una lista de movimientos en el futuro */}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 70,
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 30,
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
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  balanceLabel: {
    fontSize: 18,
    color: COLORS.gray,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginTop: 5,
  },
  buttonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 25,
  },
  actionButton: {
    backgroundColor: COLORS.darkPurple,
    width: '47%',
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  fareTableContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  fareTable: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginLeft: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fareDuration: {
    fontSize: 15,
    color: COLORS.primaryBlue,
  },
  fareDots: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderStyle: 'dotted',
    marginHorizontal: 8,
  },
  farePrice: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primaryBlue,
  },
  bottomNavigation: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  activeNavText: {
    color: COLORS.skyBlue,
  },
  // Estilos para el modal principal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.darkPurple,
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalActionButton: {
    backgroundColor: COLORS.skyBlue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalActionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos para el modal de movimientos
  movementsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  movementsModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  movementsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  movementsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  currentBalanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentBalanceLabel: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 5,
  },
  currentBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  operationsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  operationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '48%',
  },
  addButton: {
    backgroundColor: COLORS.green,
  },
  subtractButton: {
    backgroundColor: COLORS.primaryBlue,
  },
  operationButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  historySection: {
    flex: 1,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryBlue,
    marginBottom: 15,
  },
  emptyHistoryMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});