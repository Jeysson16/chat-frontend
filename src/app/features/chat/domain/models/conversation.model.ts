export interface Conversation {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[];
  participantDetails?: ConversationParticipant[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  description?: string;
  isArchived?: boolean;
  isMuted?: boolean;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member' | 'guest';
  joinedAt: Date;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ConversationPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline?: boolean;
  type: 'direct' | 'group' | 'channel';
  participantCount?: number;
}

export interface ConversationCreate {
  name?: string;
  type: 'direct' | 'group' | 'channel';
  participantIds: string[];
  description?: string;
}

export interface ConversationUpdate {
  id: string;
  name?: string;
  description?: string;
  avatar?: string;
  isArchived?: boolean;
  isMuted?: boolean;
}