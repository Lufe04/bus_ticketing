import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

type Props = {
  visible: boolean;
  success: boolean;
  passengerId?: string;
};

export default function ScanResultModal({ visible, success, passengerId }: Props) {
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    }

    if (visible) {
      const timeout = setTimeout(() => {
        if (success && passengerId) {
          router.replace({
            pathname: '/driver/boarding',
            params: { passengerId },
          });
        } else {
          router.replace('/driver/route');
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [visible, success, passengerId]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LottieView
            ref={animationRef}
            source={
              success
                ? require('../assets/lottie/success.json')
                : require('../assets/lottie/error.json')
            }
            loop={false}
            autoPlay
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
