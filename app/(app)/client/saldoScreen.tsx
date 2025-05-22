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
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';

// Paleta de colores consistente con el resto de la aplicación
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
};

export default function SaldoScreen() {
  const { currentUser } = useAuth();
  const { userData, updateUserBalance } = useUser();
  const router = useRouter();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  // Actualizar el saldo desde userData cuando cambie
  useEffect(() => {
    if (userData && userData.saldo !== undefined) {
      setCurrentBalance(userData.saldo);
    }
  }, [userData]);

  // Manejar la recarga de saldo
  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
      return;
    }
    
    if (!userData?.id) {
      Alert.alert('Error', 'No se pudo identificar el usuario actual');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateUserBalance(userData.id, amount);
      setIsModalVisible(false);
      setRechargeAmount('');
      Alert.alert('Éxito', `Se han recargado $${amount} a tu cuenta`);
    } catch (error) {
      console.error('Error al recargar saldo:', error);
      Alert.alert('Error', 'No se pudo completar la recarga. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el saldo como moneda
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(balance);
  };

  // Si no hay datos del usuario, mostrar pantalla de carga
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.skyBlue} />
          <Text style={{ marginTop: 20, color: COLORS.gray }}>
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Obtener las iniciales del nombre de usuario o usar "U" por defecto
  const getUserInitial = () => {
    if (userData?.nombre) {
      return userData.nombre.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header con saludo y avatar */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hola, {userData?.nombre || "Usuario"}
        </Text>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getUserInitial()}</Text>
        </View>
      </View>
      
      {/* Contenido principal con borde superior redondeado */}
      <View style={styles.mainContent}>
        {/* Sección de saldo */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo Disponible</Text>
          <Text style={styles.balanceAmount}>
            $ {currentBalance.toLocaleString('es-CO')}
          </Text>
          
          {/* Botón de recarga */}
          <TouchableOpacity 
            style={styles.rechargeButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="card-outline" size={24} color={COLORS.white} />
            <Text style={styles.rechargeText}>Recargar</Text>
          </TouchableOpacity>
        </View>

        {/* Tabla de valor de pasajes */}
        <View style={styles.fareContainer}>
          <View style={styles.fareHeader}>
            <Ionicons name="bus-outline" size={22} color={COLORS.gray} />
            <Text style={styles.fareTitle}>Valor pasajes</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 1 h - 2 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 8,000</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 2 h - 3 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 16,000</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 3 h - 4 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 24,000</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 4 h - 5 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 32,000</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 5 h - 6 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 40,000</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareText}>Duración: 6 h - 7 h</Text>
            <Text style={styles.fareDots}>···································</Text>
            <Text style={styles.farePrice}>$ 50,000</Text>
          </View>
        </View>
      </View>
      
      {/* Modal de Recarga */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recargar Saldo</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                keyboardType="numeric"
                value={rechargeAmount}
                onChangeText={setRechargeAmount}
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setRechargeAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleRecharge}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Recargar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBlue,
  },
  header: {
    paddingTop: 50,
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
  avatarContainer: {
    backgroundColor: COLORS.white,
    height: 48,
    width: 48,
    borderRadius: 24,
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
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  balanceSection: {
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  rechargeButton: {
    backgroundColor: COLORS.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rechargeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fareContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  fareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: COLORS.gray,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fareText: {
    fontSize: 15,
    color: '#333',
    flex: 2,
  },
  fareDots: {
    fontSize: 12,
    color: '#ccc',
    flex: 1,
    textAlign: 'center',
  },
  farePrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  // Estilos para el modal (mantenidos de la versión anterior)
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  inputPrefix: {
    fontSize: 24,
    color: COLORS.primaryBlue,
    marginRight: 5,
  },
  amountInput: {
    fontSize: 24,
    color: COLORS.primaryBlue,
    textAlign: 'center',
    minWidth: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    width: '45%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.skyBlue,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});