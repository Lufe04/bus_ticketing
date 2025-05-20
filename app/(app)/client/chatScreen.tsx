import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { useUser } from '../../../context/UserContext';
// Asegurar que la importación coincida con el nombre real del archivo (mayúscula/minúscula)
import { useChatContext, Message } from '../../../context/ChatContext';

// Paleta de colores consistente
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  gray: '#989898',
  lightGray: '#F2F4F5',
  white: '#FFFFFF',
  green: '#4CAF50',
  mediumGray: '#AAAAAA',
  chatBubbleUser: '#20ADF5',
  chatBubbleBot: '#E0E0E0',
};

export default function ChatScreen() {
  const { currentUser } = useAuth();
  const { userData } = useUser();
  const { messages, isLoading, sendMessage } = useChatContext();
  const router = useRouter();
  
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll al último mensaje cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages?.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Ya no iniciamos un mensaje bienvenida aquí, lo hacemos desde el contexto
  
  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const messageText = inputText;
    setInputText(''); // Limpiar input inmediatamente para mejor UX
    
    console.log("Enviando mensaje desde la pantalla:", messageText);
    await sendMessage(messageText);
  };
  
  // Renderizar un mensaje de chat
  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.sender === 'user';
    
    return (
      <View style={[
        styles.messageBubbleContainer,
        isUserMessage ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessage : styles.botMessage
        ]}>
          <Text style={[
            styles.messageText,
            isUserMessage ? styles.userMessageText : styles.botMessageText
          ]}>
            {item.text || "Mensaje sin contenido"}
          </Text>
          
          <Text style={[
            styles.timeText,
            isUserMessage ? styles.userTimeText : styles.botTimeText
          ]}>
            {formatTime(new Date(item.timestamp))}
          </Text>
        </View>
      </View>
    );
  };
  
  // Formatear hora del mensaje
  const formatTime = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return ""; // En caso de fecha inválida
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Obtener el nombre del usuario o un placeholder
  const userName = userData?.nombre || 'Usuario';
  // Primera letra del usuario para el avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hola, {userName}</Text>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </View>
      
      {/* Chat Messages */}
      <View style={styles.chatContainer}>
        {messages && messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id || `msg-${Date.now()}-${Math.random()}`}
            contentContainerStyle={styles.messagesList}
          />
        ) : (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>Cargando conversación...</Text>
          </View>
        )}
        
        {/* Indicador de escritura */}
        {isLoading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={COLORS.skyBlue} />
            <Text style={styles.typingText}>Respondiendo...</Text>
          </View>
        )}
      </View>
      
      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TextInput
          style={styles.input}
          placeholder="Escribe aquí"
          placeholderTextColor={COLORS.gray}
          value={inputText}
          onChangeText={setInputText}
          multiline={true}
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !inputText.trim().length && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim().length || isLoading}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 + 10 : 10,
    paddingBottom: 16,
  },
  headerTitle: {
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
  chatContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageBubbleContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: COLORS.chatBubbleUser,
  },
  botMessage: {
    backgroundColor: COLORS.chatBubbleBot,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.primaryBlue,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimeText: {
    color: COLORS.gray,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
    maxHeight: 120,
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: COLORS.skyBlue,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    color: COLORS.gray,
    fontSize: 16,
  }
});