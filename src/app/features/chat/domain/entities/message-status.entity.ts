export interface MessageStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}