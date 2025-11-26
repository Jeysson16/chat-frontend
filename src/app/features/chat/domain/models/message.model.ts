export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'audio' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: MessageAttachment[];
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: Date;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'audio';
  size: number;
  mimeType: string;
}

export interface MessageCreate {
  conversationId: string;
  text: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  attachments?: File[];
  replyTo?: string;
}

export interface MessageUpdate {
  id: string;
  text: string;
}
