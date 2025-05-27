import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; 
import { useRouter } from 'expo-router';


export default function UserMenuModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { logout } = useAuth(); 
  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth'); 
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <MenuItem icon={<MaterialIcons name="person" size={22} />} label="Mi Perfil" />
          <MenuItem icon={<MaterialIcons name="settings" size={22} />} label="Configuración" />
          <MenuItem icon={<FontAwesome name="globe" size={20} />} label="Cambiar Idioma" />
          <MenuItem icon={<MaterialIcons name="notifications-none" size={22} />} label="Notificaciones" />
          <View style={styles.divider} />
          <MenuItem
            icon={<MaterialIcons name="logout" size={22} color="#FF2E2E" />}
            label="Cerrar Sesión"
            labelStyle={{ color: '#FF2E2E' }}
            onPress={handleLogout}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function MenuItem({ icon, label, labelStyle = {}, onPress }: { icon: React.ReactNode; label: string; labelStyle?: any; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
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
