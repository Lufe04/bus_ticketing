import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ScanResultModal from '../../../components/ScanResultModal';

export default function ScanScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true); // depende del resultado del QR

  const handleScanResult = (result: boolean) => {
    setIsSuccess(result);
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="arrow-back" size={30} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Escanear Pasajes</Text>
        </View>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>U</Text>
        </View>
      </View>

      {/* QR Icono */}
      <View style={styles.content}>
        <MaterialIcons name="qr-code-2" size={140} color="#000" />
        <Button title="Simular Éxito" onPress={() => handleScanResult(true)} />
        <Button title="Simular Error" onPress={() => handleScanResult(false)} />
        <Text style={styles.instructionText}>
          Alinea el código QR dentro del recuadro para escanearlo correctamente.
        </Text>
      </View>
      <ScanResultModal visible={modalVisible} success={isSuccess} />
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
