import React, { createContext, useContext, useState } from "react";

// Definición de interfaces
interface Message {
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

// API Key de Gemini
const GEMINI_API_KEY = "AIzaSyCFPEdbkbO_90iTylK8KrsOtQzKSVCxiNE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Función para enviar un mensaje y obtener respuesta de Gemini
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Crear y añadir el mensaje del usuario
    const userMessage: Message = {
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);

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

      const data = await response.json();
      
      // Extraer el texto de la respuesta
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Lo siento, no pude procesar tu pregunta en este momento.";

      // Crear y añadir el mensaje del bot
      const botMessage: Message = {
        text: responseText,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al comunicarse con Gemini API:", error);
      
      // Mensaje de error en caso de fallo
      const errorMessage: Message = {
        text: "Lo siento, hubo un problema al conectar con nuestro servicio. Por favor, inténtalo de nuevo más tarde.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
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