import React, { createContext, useContext, useState, useEffect } from "react";

// Definición de interfaces
export interface Message {
  id?: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
}

// Creación del contexto con valores predeterminados
const ChatContext = createContext<ChatContextType>({
  messages: [],
  isLoading: false,
  sendMessage: async () => {},
  clearMessages: () => {},
});

// API Key de Gemini ahora desde variables de entorno
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = process.env.EXPO_PUBLIC_GEMINI_API_URL || 
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Inicializar con mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        text: '¡Hola! No dudes en escribir tu pregunta sobre nuestros servicios de bus',
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Función para enviar un mensaje y obtener respuesta de Gemini
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    console.log("Enviando mensaje en contexto:", text);
    console.log("API KEY disponible:", !!GEMINI_API_KEY);

    // Crear y añadir el mensaje del usuario
    const userMessage: Message = {
      id: 'user-' + Date.now(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    
    // Actualizar mensajes con el mensaje del usuario
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Llamada a la API de Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Eres un asistente de soporte de una aplicación de tickets de bus.
                     Brinda información acerca de horarios, rutas, políticas de equipaje, proceso de compra y reembolsos.
                     Responde de manera concisa y amigable.
                     Pregunta: ${text}`
            }] 
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Error API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Respuesta recibida:", JSON.stringify(data).slice(0, 100) + "...");
      
      // Extraer la respuesta de la API
      let botResponseText = "Lo siento, no pude procesar tu solicitud.";
      
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        botResponseText = data.candidates[0].content.parts[0].text;
      }
      
      // Crear mensaje del bot
      const botMessage: Message = {
        id: 'bot-' + Date.now(),
        text: botResponseText,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      // Actualizar los mensajes con la respuesta del bot
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
    } catch (error) {
      console.error("Error al comunicarse con Gemini API:", error);
      
      // Mensaje de error
      const errorMessage: Message = {
        id: 'error-' + Date.now(),
        text: "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta más tarde.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para limpiar todos los mensajes
  const clearMessages = () => {
    setMessages([]);
  };

  // Proveedor del contexto
  return (
    <ChatContext.Provider value={{ 
      messages, 
      isLoading, 
      sendMessage,
      clearMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useChatContext = () => useContext(ChatContext);

export default ChatContext;