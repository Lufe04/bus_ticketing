import React, { useEffect } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type Props = {
  visible: boolean;
  success: boolean;
};

export default function ScanResultModal({ visible, success }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        router.replace(success ? '/driver/boarding' : '/driver/route');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <DotLottieReact
            src={
              success
                ? 'https://lottie.host/2419a54d-fadf-49bb-ac69-d5f412f86701/rUjO7jDiHj.lottie'
                : 'https://lottie.host/fe6bc43d-fc11-4b8c-a637-581c660c02ef/NxdwwT9III.lottie'
            }
            loop={false}
            autoplay
            style={{ width: 150, height: 150 }}
          />

          <Text style={styles.title}>
            {success
              ? 'Pasaje Escaneado Correctamente'
              : 'Pasaje Escaneado Inválido'}
          </Text>

          {!success && (
            <Text style={styles.subtitle}>
              Asegúrate de que el pasaje corresponde a esta ruta.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 25,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
  },
});
