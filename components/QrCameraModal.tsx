import React, { useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';

interface QrScannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

export default function QrScannerModal({ isVisible, onClose, onCodeScanned }: QrScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ color: '#fff', marginBottom: 10 }}>Se requiere permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.requestButton}>
          <Feather name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      onCodeScanned(data);
      setTimeout(() => {
        setScanned(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: '#00000080',
    padding: 8,
    borderRadius: 20,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestButton: {
    backgroundColor: '#ffa500',
    padding: 12,
    borderRadius: 8,
  },
});
