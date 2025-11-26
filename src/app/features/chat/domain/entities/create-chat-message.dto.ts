export interface CreateChatMessageDto {
  conversationId: number;
  text: string;
  type?: string;
  // Nueva propiedad del backend reestructurado
  senderId?: string; // Se establecerá automáticamente en el backend
}