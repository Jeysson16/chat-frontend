export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  text: string;
  type: string;
  timestamp: Date;
  isRead: boolean;
  // Nuevas propiedades del backend reestructurado
  senderAvatar?: string;
  senderIsOnline?: boolean;
}

export interface SendMessageDto {
  conversationId: number;
  text: string;
  type?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}