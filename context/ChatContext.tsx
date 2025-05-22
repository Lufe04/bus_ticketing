<<<<<<< HEAD
import React, { createContext, useContext, useState } from "react";
import { APIResponse } from "@/interfaces/Responses";
import { Message } from "../interfaces/AppInterfaces";

interface MessageWithKey extends Message {
    key: string;
    idts: string;
=======
import React, { createContext, useContext, useState, useEffect } from "react";

// Definición de interfaces
export interface Message {
  id?: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
>>>>>>> 50de68a706106b4492e3f9fdffd3ecf6e2587670
}

interface ChatContextType {
    messages: MessageWithKey[];
    isLoading: boolean;
    clearMessages: () => void;
    sendMessage: (text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
    messages: [],
    isLoading: false,
    clearMessages: () => {},
    sendMessage: async () => {},
});

<<<<<<< HEAD
export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<MessageWithKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const clearMessages = () => {
        setMessages([]);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
=======
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
>>>>>>> 50de68a706106b4492e3f9fdffd3ecf6e2587670

        // Crear mensaje del usuario
        const newMessage: MessageWithKey = {
            idts: Date.now().toString(),
            text,
            sender: "user",
            fecha: new Date().toISOString(),
            emisor: "Usuario",
            message: text,
            key: Date.now().toString(),
        };
        
        // IMPORTANTE: Añadir el mensaje del usuario al estado
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Marcar como cargando (para mostrar indicador)
        setIsLoading(true);
        
        try {
            // Llamada a la API de Gemini
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCFPEdbkbO_90iTylK8KrsOtQzKSVCxiNE", {
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
            
            // Procesar respuesta
            const data: APIResponse = await response.json();
            
            // Extraer el texto de respuesta
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                                "Lo siento, no pude entender tu pregunta.";
                                
            // Crear mensaje de respuesta
            const botMessage: MessageWithKey = {
                idts: (Date.now() + 1).toString(),
                text: responseText,
                sender: "bot",
                fecha: new Date().toISOString(),
                emisor: "AI",
                message: responseText,
                key: (Date.now() + 1).toString(),
            };
            
            // Añadir respuesta a los mensajes
            setMessages(prevMessages => [...prevMessages, botMessage]);
            
        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            
            // Mensaje de error
            const errorMessage: MessageWithKey = {
                idts: (Date.now() + 1).toString(),
                text: "Ha ocurrido un error. Por favor, intenta nuevamente más tarde.",
                sender: "bot",
                fecha: new Date().toISOString(),
                emisor: "AI",
                message: "Error",
                key: (Date.now() + 1).toString(),
            };
            
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            // Fin de carga
            setIsLoading(false);
        }
    };

<<<<<<< HEAD
    return (
        <ChatContext.Provider value={{ messages, isLoading, clearMessages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => useContext(ChatContext);
=======
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
>>>>>>> 50de68a706106b4492e3f9fdffd3ecf6e2587670
