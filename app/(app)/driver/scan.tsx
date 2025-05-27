import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScanResultModal from '../../../components/ScanResultModal';
import QrScannerModal from '../../../components/QrCameraModal';
import UserMenuModal from '../../../components/UserModal';
import { useUser } from '../../../context/UserContext';
import { useRouter } from 'expo-router';
import { useBoarding } from '../../../context/BoardingContext';
import { collection, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/utils/FirebaseConfig';


export default function ScanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true); 
  const [scannerVisible, setScannerVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { userData } = useUser();
  const nombreUsuario = userData?.nombre || 'Usuario';
  const inicial = nombreUsuario.charAt(0).toUpperCase();
  const router = useRouter();
  const { boardings, getCurrentBoarding, getBoardings } = useBoarding();
  const [passengerIdScanned, setPassengerIdScanned] = useState<string | null>(null);

  const handleScanResult = async (userId: string) => {
      console.log("Escaneando ID de usuario:", userId);
      const currentBoarding = getCurrentBoarding();
      if (!currentBoarding || !currentBoarding.id) {
        console.warn("⚠️ No hay ruta activa");
        setIsSuccess(false);
        setModalVisible(true);
        return;
      }

      try {
        const pasajerosRef = collection(db, `boarding/${currentBoarding.id}/pasajeros`);
        const q = query(pasajerosRef, where('idUsuario', '==', userId.trim()));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          if (data.escaneado === true) {
            console.warn('⚠️ El pasaje ya fue escaneado anteriormente');
            setPassengerIdScanned(null);
            setIsSuccess(false);
          } else {
            await updateDoc(doc.ref, { escaneado: true });
            await getBoardings(); 
            console.log('✅ Pasajero validado y actualizado');
            setPassengerIdScanned(userId);
            setIsSuccess(true);
          }
        } else {
          console.warn('❌ Pasajero no encontrado en esta ruta');
          setPassengerIdScanned(null);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('❌ Error al validar pasajero:', error);
        setIsSuccess(false);
      }
      setModalVisible(true);
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" style={{ marginRight: 10 }} onPress={() => router.replace("/(app)/driver/route")} />
          <Text style={styles.headerTitle}>Escanear Pasajes</Text>
        </View>
        <TouchableOpacity style={styles.userCircle} onPress={() => setMenuVisible(true)}>
          <Text style={styles.userInitial}>{inicial}</Text>
        </TouchableOpacity>
      </View>

      {/* QR Icono */}
      <View style={styles.content}>
        <MaterialIcons name="qr-code-2" size={140} color="#000" />
        <Button title="Escanear Código QR" onPress={() => setScannerVisible(true)} />
        <Text style={styles.instructionText}>
          Alinea el código QR dentro del recuadro para escanearlo correctamente.
        </Text>
      </View>
      <ScanResultModal visible={modalVisible} success={isSuccess} passengerId={passengerIdScanned ?? undefined}/>
      <QrScannerModal isVisible={scannerVisible} onClose={() => setScannerVisible(false)} onCodeScanned={(data) => handleScanResult(data)}/> 
      <UserMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#08173B',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
});
