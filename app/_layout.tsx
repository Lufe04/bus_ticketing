import { AuthProvider } from "../context/AuthContext";
import { Stack } from "expo-router";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { UserProvider } from "@/context/UserContext";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Función para registrar y obtener el token de notificaciones push
async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('❌ Permiso de notificaciones denegado');
      return null;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        console.error('❌ Project ID no encontrado en app.json');
        return null;
      }

      const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenResponse.data;
    } catch (e) {
      console.error('❌ Error al obtener el token de notificación:', e);
      return null;
    }
  } else {
    alert('Debes usar un dispositivo físico para notificaciones push');
    return null;
  }
}

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Registro de token
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listener para notificaciones recibidas
    /*notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("📨 Notificación recibida:", notification);
    });

    // Listener para respuestas a notificaciones
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("📬 Respuesta a notificación:", response);
    });*/

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="index" />
        </Stack>
      </UserProvider>
    </AuthProvider>
  );
}
