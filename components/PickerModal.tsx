import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface ModalPickerProps {
  visible: boolean;
  type: 'month' | 'year';
  selectedValue: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}

const months = ['ENER', 'FEBR', 'MARZ', 'ABRL', 'MAY', 'JUN', 'JUL', 'AGOS', 'SEPT', 'OCT', 'NOV', 'DEC'];
const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i); // Ej: 2020 a 2030

export default function ModalPicker({ visible, type, selectedValue, onSelect, onClose }: ModalPickerProps) {
  const data = type === 'month' ? months.map((m, i) => ({ label: m, value: i + 1 })) : years.map(y => ({ label: `${y}`, value: y }));

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <FlatList
            data={data}
            numColumns={3}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  item.value === selectedValue && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  item.value === selectedValue && styles.selectedOptionText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '80%',
    paddingVertical: 20,
  },
  option: {
    flex: 1,
    margin: 6,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: '#20ADF5',
    borderColor: '#20ADF5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
