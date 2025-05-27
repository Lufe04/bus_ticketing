// components/TripConfirmationModal.tsx
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TripConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  action: 'start' | 'arrival' | 'end';
  stopName?: string;
}

const TripConfirmationModal: React.FC<TripConfirmationModalProps> = ({ visible, onCancel, onConfirm, action,stopName = ''}) => {
  let title = '';
  let subtitle = '';

  switch (action) {
    case 'start':
      title = `¿Has llegado a ${stopName}?`;
      subtitle = 'Confirma que estás en la parada inicial para iniciar el viaje.';
      break;
    case 'arrival':
      title = `¿Has llegado a ${stopName}?`;
      subtitle = 'Confirma que has llegado a esta parada.';
      break;
    case 'end':
      title = '¿Deseas finalizar el viaje?';
      subtitle = 'Esta acción marcará el viaje como finalizado.';
      break;
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="check-circle" size={70} color="#4CAF50" />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
              <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.confirmButton]}>
              <Text style={styles.buttonText}>Si. Llegue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TripConfirmationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '85%',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EEE',
  },
  confirmButton: {
    backgroundColor: '#08173B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelText: {
    color: '#444',
  },
});
