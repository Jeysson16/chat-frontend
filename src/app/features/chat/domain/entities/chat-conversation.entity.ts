import { ChatUser } from './chat-user.entity';
import { ChatMessage } from './chat-message.entity';

export interface ChatConversation {
  id: number;
  name: string;
  type: string;
  createdAt: Date;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  // Nuevas propiedades del backend reestructurado
  displayName?: string;
  otherParticipantIsOnline?: boolean;
}

export interface CreateConversationDto {
  name: string;
  type: string;
  participantIds: string[];
  // Nueva propiedad del backend reestructurado
  createdBy?: string; // Se establecerá automáticamente en el backend
}