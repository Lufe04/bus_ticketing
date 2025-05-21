import React, { createContext, useContext, useState } from "react";
import { APIResponse } from "@/interfaces/Responses";
import { Message } from "../interfaces/AppInterfaces";

interface MessageWithKey extends Message {
    key: string;
    idts: string;
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

export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessages] = useState<MessageWithKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const clearMessages = () => {
        setMessages([]);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

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

    return (
        <ChatContext.Provider value={{ messages, isLoading, clearMessages, sendMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => useContext(ChatContext);