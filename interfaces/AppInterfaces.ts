export interface Message {
    idts: string;      // ID del mensaje
    text: string;      // Contenido del mensaje
    sender: "user" | "bot"; // Quién envió el mensaje
    fecha: string;     // Fecha del mensaje
    emisor: string;    // Nombre del emisor
    message: string;   // Puede ser redundante con 'text'
  }
  