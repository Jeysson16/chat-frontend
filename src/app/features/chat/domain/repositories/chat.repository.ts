import { Observable } from 'rxjs';
import { 
  ChatUser, 
  ChatMessage, 
  Conversation
} from '../models/chat.model';

export abstract class ChatRepository {
  // User methods
  abstract getCurrentUser(): Observable<ChatUser>;
  abstract updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy'): Observable<void>;
  
  // Conversation methods
  abstract getConversations(): Observable<Conversation[]>;
  abstract getConversation(conversationId: string): Observable<Conversation>;
  abstract createConversation(participants: string[], name?: string): Observable<Conversation>;
  abstract updateConversation(conversationId: string, updates: Partial<Conversation>): Observable<Conversation>;
  abstract deleteConversation(conversationId: string): Observable<void>;
  abstract joinConversation(conversationId: string): Observable<void>;
  abstract leaveConversation(conversationId: string): Observable<void>;
  
  // Message methods
  abstract getMessages(conversationId: string, page?: number, limit?: number): Observable<ChatMessage[]>;
  abstract sendMessage(conversationId: string, content: string, type?: 'text' | 'image' | 'file' | 'audio'): Observable<ChatMessage>;
  abstract markMessageAsRead(messageId: string): Observable<void>;
  abstract markConversationAsRead(conversationId: string): Observable<void>;
  abstract getMessageStatus(messageId: string): Observable<any>;
  
  // Contact methods
  abstract getContacts(): Observable<ChatUser[]>;
  abstract searchContacts(query: string): Observable<ChatUser[]>;
  abstract sendContactRequest(userId: string, message?: string): Observable<void>;
  abstract getContactRequests(): Observable<ChatUser[]>;
  abstract respondToContactRequest(userId: string, accept: boolean): Observable<void>;
  abstract removeContact(contactId: string): Observable<void>;
  
  // Real-time methods
  abstract startTyping(conversationId: string): Observable<void>;
  abstract stopTyping(conversationId: string): Observable<void>;
}
