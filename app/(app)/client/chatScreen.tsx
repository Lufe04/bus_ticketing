import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useChatContext } from '../../../context/ChatContext';

// Paleta de colores consistente con el resto de la aplicación
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  mediumGray: '#AAAAAA',
  chatBubbleGray: '#D9D9D9',
  errorRed: '#FF6B6B',
};

// Lista de temas permitidos para filtrar preguntas irrelevantes
const ALLOWED_TOPICS = [
  'bus', 'buses', 'ruta', 'rutas', 'viaje', 'viajes', 'ticket', 'tickets', 'tiquete', 'tiquetes',
  'hora', 'horario', 'horarios', 'salida', 'llegada', 'terminal', 'estación', 'parada',
  'precio', 'tarifa', 'tarifas', 'costo', 'costos', 'pago', 'pagos', 'saldo',
  'reembolso', 'cancelar', 'cancelación', 'cambio', 'reprogramar',
  'equipaje', 'maleta', 'maletas', 'bulto', 'bultos', 'asiento', 'asientos',
  'reserva', 'reservación', 'compra', 'billete', 'billetes',
  'discapacidad', 'accesibilidad', 'transporte', 'transbordo',
];

export default function ChatScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Usar el contexto de chat para manejar los mensajes
  const { messages: contextMessages, isLoading, sendMessage: sendGeminiMessage, clearMessages } = useChatContext();
  
  const [newMessage, setNewMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [offTopicWarning, setOffTopicWarning] = useState(false);

  // Convertir mensajes del contexto al formato local para mostrarlos
  const formattedMessages = [
    // Mensaje inicial de bienvenida
    {
      id: 'welcome',
      text: '¡Hola! No dudes en escribir tu pregunta sobre nuestros servicios de transporte en bus.',
      sender: 'support' as const,
      timestamp: new Date()
    },
    // Mensajes del contexto
    ...contextMessages.map((msg, index) => ({
      id: msg.timestamp,
      text: msg.text,
      sender: msg.sender === 'user' ? 'user' as const : 'support' as const,
      timestamp: new Date(msg.timestamp)
    }))
  ];

  // Detectar cuando el teclado aparece/desaparece
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Hacer scroll automático al final cuando llegan nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [formattedMessages, isLoading]);

  // Función para verificar si el mensaje está relacionado con temas de buses
  const isRelevantTopic = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    // Verificar si alguna palabra clave está en el mensaje
    return ALLOWED_TOPICS.some(topic => lowerText.includes(topic)) || 
           lowerText.length < 15; // Mensajes cortos se permiten sin filtrar
  };

  // Función para enviar un mensaje
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    // Verificar si el mensaje está dentro de los temas permitidos
    if (!isRelevantTopic(newMessage)) {
      setOffTopicWarning(true);
      setTimeout(() => setOffTopicWarning(false), 3000);
      return;
    }
    
    // Limpiar el campo de mensaje y enviar a través del contexto
    const messageText = newMessage.trim();
    setNewMessage('');
    setOffTopicWarning(false);
    
    // Enviar mensaje a través del contexto (que usará Gemini API)
    await sendGeminiMessage(messageText);
  };

  // Función para hacer scroll al final de la conversación
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Obtener el nombre del usuario desde userData
  const userName = userData?.nombre || 'Usuario';
  // Primera letra del usuario para el avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hola, {userName}</Text>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </View>
      
      {/* Chat area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {formattedMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userBubble : styles.supportBubble
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
          
          {/* Indicador de carga mientras se espera respuesta */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.skyBlue} />
              <Text style={styles.loadingText}>Consultando...</Text>
            </View>
          )}
          
          {/* Advertencia de tema fuera de contexto */}
          {offTopicWarning && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                Por favor, haz preguntas relacionadas con nuestros servicios de transporte en bus.
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Message input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline={true}
            maxLength={500}
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={newMessage.trim() === '' || isLoading}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={(newMessage.trim() === '' || isLoading) ? COLORS.mediumGray : COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Botón para limpiar la conversación */}
      {formattedMessages.length > 1 && !keyboardVisible && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearMessages}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.clearButtonText}>Limpiar chat</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primaryBlue,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    marginBottom: 12,
  },
  supportBubble: {
    backgroundColor: COLORS.chatBubbleGray,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.skyBlue,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 14,
  },
  warningContainer: {
    backgroundColor: COLORS.errorRed,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  warningText: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.skyBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    bottom: 70,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 14,
    marginLeft: 5,
  },
  bottomNavigation: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  activeNavText: {
    color: COLORS.skyBlue,
  },
});
