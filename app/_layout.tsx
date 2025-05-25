import { AuthProvider } from "../context/AuthContext";
import { Stack } from "expo-router";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants, { UserInterfaceIdiom } from 'expo-constants';
import { Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import { UserProvider } from "@/context/UserContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
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
      console.warn('Failed to get push token for push notification!');
      alert('Failed to get push token for push notification!');
      return null;
    }
    
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.error('Project ID not found - check your app.json or app.config.js');
        return null;
      }
      
      const tokenResponse = await Notifications.getExpoPushTokenAsync({projectId,});  
      token = tokenResponse.data;
      console.log('Push notification token:', token);
      return token;
    } catch (e) {
      console.error('Error getting push token:', e);
      return null;
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
    alert('Must use physical device for Push Notifications');
  }
  return token;
}

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });

    // Listener para notificaciones recibidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 Notificación recibida:', notification);
    });

    // Listener para respuestas del usuario a una notificación
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👉 Usuario tocó la notificación:', response);
    });

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
      <Stack
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="auth"/>
        <Stack.Screen name="(app)"/>
        <Stack.Screen name="index"/>
      </Stack>
      </UserProvider>
    </AuthProvider>
  )
}