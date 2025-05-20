import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function UserMenuModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <MenuItem icon={<MaterialIcons name="person" size={22} />} label="Mi Perfil" />
          <MenuItem icon={<MaterialIcons name="settings" size={22} />} label="Configuración" />
          <MenuItem icon={<FontAwesome name="globe" size={20} />} label="Cambiar Idioma" />
          <MenuItem icon={<MaterialIcons name="notifications-none" size={22} />} label="Notificaciones" />
          <View style={styles.divider} />
          <MenuItem icon={<MaterialIcons name="logout" size={22} color="#FF2E2E" />} label="Cerrar Sesión" labelStyle={{ color: '#FF2E2E' }} />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function MenuItem({ icon, label, labelStyle = {} }: { icon: React.ReactNode; label: string; labelStyle?: any }) {
  return (
    <TouchableOpacity style={styles.item}>
      {icon}
      <Text style={[styles.text, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menu: {
    backgroundColor: '#fff',
    width: 200,
    borderRadius: 14,
    paddingVertical: 8,
    elevation: 5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  text: {
    fontSize: 14,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 6,
  },
});
