import { ChatUser } from './chat-user.entity';

export interface ConversationPreview {
  id: number;
  name: string;
  type: 'individual' | 'group';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  user?: ChatUser; // For individual conversations
  participants: ChatUser[];
  isPinned?: boolean;
  // Nuevas propiedades del backend reestructurado
  displayName?: string;
  otherParticipantIsOnline?: boolean;
}