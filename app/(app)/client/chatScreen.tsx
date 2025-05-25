import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Text as RNText,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    SafeAreaView,
    StatusBar
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { useChatContext } from "@/context/chatContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Paleta de colores consistente con el resto de la aplicación
const COLORS = {
  primaryBlue: '#131A2E',
  skyBlue: '#20ADF5',
  green: '#4CAF50',
  gray: '#989898',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#333333',
  charcoalGray: '#2E2E2E'
};

const ChatScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { messages, isLoading, sendMessage, clearMessages } = useChatContext();
    const [message, setMessage] = useState("");
    const flatListRef = useRef<FlatList>(null);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // Detectar cuando el teclado aparece/desaparece
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
                
                // Ocultar TabBar cuando aparece el teclado
                navigation.setOptions({
                    tabBarStyle: { display: 'none' }
                });
                
                setTimeout(() => {
                    if (flatListRef.current) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            }
        );
        
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                
                // Mostrar TabBar cuando desaparece el teclado
                navigation.setOptions({
                    tabBarStyle: undefined // Restablece al estilo predeterminado
                });
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            // Restaurar la visibilidad del TabBar al desmontar
            navigation.setOptions({
                tabBarStyle: undefined
            });
        };
    }, [navigation]);

    const handleSend = async () => {
        if (!message.trim()) return;
        await sendMessage(message);
        setMessage("");
        
        setTimeout(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
        }, 200);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryBlue} />
            
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    
                    <RNText style={styles.headerTitle}>Asistente de viajes</RNText>
                    
                    {messages.length > 0 && (
                        <TouchableOpacity onPress={clearMessages} style={styles.clearButton}>
                            <Ionicons name="trash-outline" size={22} color={COLORS.white} />
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Contenedor principal (flex: 1) */}
                <View style={styles.contentContainer}>
                    {/* Lista de mensajes */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.key}
                        renderItem={({ item }) => (
                            <View
                                style={[
                                    styles.messageBubble,
                                    item.sender === "user" ? styles.userBubble : styles.botBubble,
                                ]}
                            >
                                <RNText 
                                    style={[
                                        styles.messageText,
                                        item.sender === "user" ? styles.userText : styles.botText
                                    ]}
                                >
                                    {item.text}
                                </RNText>
                            </View>
                        )}
                        contentContainerStyle={styles.messageListContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.skyBlue} style={styles.emptyIcon} />
                                <RNText style={styles.loadingText}>
                                    {isLoading ? "Cargando..." : "No hay mensajes aún. Haz tu primera pregunta sobre nuestros servicios de bus."}
                                </RNText>
                            </View>
                        }
                        onLayout={() => {
                            if (messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                        onContentSizeChange={() => {
                            if (messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                    />

                    {/* Indicador de carga */}
                    {isLoading && (
                        <View style={styles.loadingIndicator}>
                            <Ionicons name="ellipsis-horizontal" size={30} color={COLORS.skyBlue} />
                        </View>
                    )}
                </View>
                
                {/* Input - ahora es parte del KeyboardAvoidingView */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={COLORS.gray}
                        value={message}
                        onChangeText={setMessage}
                        onSubmitEditing={handleSend}
                        multiline={true}
                        maxLength={500}
                    />
                    <TouchableOpacity 
                        onPress={handleSend} 
                        disabled={isLoading || !message.trim()} 
                        style={[
                            styles.sendButton,
                            (isLoading || !message.trim()) && styles.disabledButton
                        ]}
                    >
                        <Ionicons 
                            name="send" 
                            size={24} 
                            color={(isLoading || !message.trim()) ? COLORS.gray : COLORS.skyBlue} 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Estilos rediseñados para una estructura más limpia
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.primaryBlue,
    },
    keyboardAvoid: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    contentContainer: {
        flex: 1,
        position: 'relative'
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: COLORS.primaryBlue,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        padding: 5,
    },
    clearButton: {
        padding: 5,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: "600",
    },
    messageListContainer: {
        padding: 16,
        flexGrow: 1,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingBottom: 20,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 12,
        borderRadius: 16,
        marginVertical: 6,
    },
    userBubble: { 
        alignSelf: "flex-end", 
        backgroundColor: COLORS.skyBlue,
        borderBottomRightRadius: 4,
        marginLeft: 40,
    },
    botBubble: { 
        alignSelf: "flex-start", 
        backgroundColor: COLORS.primaryBlue,
        borderBottomLeftRadius: 4,
        marginRight: 40,
    },
    messageText: { 
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: COLORS.white,
    },
    botText: {
        color: COLORS.white,
    },
    loadingIndicator: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        padding: 8,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    loadingText: { 
        textAlign: "center", 
        color: COLORS.gray, 
        marginVertical: 20,
        paddingHorizontal: 30,
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
        backgroundColor: COLORS.white,
    },
    input: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        color: COLORS.black,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        fontSize: 16,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    sendButton: { 
        marginLeft: 10,
        height: 44,
        width: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.white,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    disabledButton: {
        opacity: 0.5,
    }
});

export default ChatScreen;