export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
  companyId?: string;
  companyName?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  type: 'private' | 'group';
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  originalContent?: string; // Store original content for translation reference
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  timestamp: Date;
  isRead: boolean;
  readBy?: ReadReceipt[];
  attachments?: Attachment[];
  replyTo?: string;
}

export interface ReadReceipt {
  userId: string;
  readAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  companyId?: string;
  companyName?: string;
  isActive: boolean;
}

export interface ContactRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  attachments?: Attachment[];
  replyTo?: string;
}

export interface CreateConversationRequest {
  name?: string;
  type: 'private' | 'group';
  participantIds: string[];
}

export interface UpdateConversationRequest {
  name?: string;
  participantIds?: string[];
}

export interface MessageStatus {
  messageId: string;
  conversationId: string;
  userId: string;
  isRead: boolean;
  readAt?: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}
