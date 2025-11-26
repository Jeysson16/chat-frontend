import { Injectable } from '@angular/core';
import { Observable, map, from, of, catchError } from 'rxjs';
import {
    ChatMessage,
    ChatUser,
    Conversation
} from '../../domain/models/chat.model';
import { ChatRepository } from '../../domain/repositories/chat.repository';
import { ChatAdapter } from '../adapters/chat.adapter';
import { ChatApiService } from '../services/chat-api.service';
import { ChatSignalRService } from '../services/chat-signalr.service';

@Injectable({
  providedIn: 'root'
})
export class ChatRepositoryImpl extends ChatRepository {
  private readonly MOCK_USERS: ChatUser[] = [
    { id: 'u1', name: 'Ana García', email: 'ana.garcia@example.com', role: 'user', isActive: true, isOnline: true },
    { id: 'u2', name: 'Luis Fernández', email: 'luis.fernandez@example.com', role: 'user', isActive: true, isOnline: false },
    { id: 'u3', name: 'María López', email: 'maria.lopez@example.com', role: 'user', isActive: true, isOnline: true },
    { id: 'u4', name: 'Jorge Pérez', email: 'jorge.perez@example.com', role: 'user', isActive: true, isOnline: false }
  ];

  private readonly MOCK_CONVERSATIONS: Conversation[] = [
    {
      id: 'c1',
      name: 'Chat con Ana',
      type: 'private',
      participants: [this.MOCK_USERS[0], this.MOCK_USERS[1]],
      lastMessage: {
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'Ana García',
        content: 'Hola, ¿cómo estás?',
        type: 'text',
        timestamp: new Date(),
        isRead: false
      },
      isActive: true,
      createdAt: new Date()
    },
    {
      id: 'c2',
      name: 'Proyecto SICOM',
      type: 'group',
      participants: [this.MOCK_USERS[0], this.MOCK_USERS[2], this.MOCK_USERS[3]],
      lastMessage: {
        id: 'm2',
        conversationId: 'c2',
        senderId: 'u3',
        senderName: 'María López',
        content: 'Adjunté el documento de requisitos.',
        type: 'text',
        timestamp: new Date(),
        isRead: true
      },
      isActive: true,
      createdAt: new Date()
    }
  ];

  private readonly MOCK_MESSAGES: Record<string, ChatMessage[]> = {
    c1: [
      {
        id: 'm1',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'Ana García',
        content: 'Hola, ¿cómo estás?',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false
      },
      {
        id: 'm2',
        conversationId: 'c1',
        senderId: 'u2',
        senderName: 'Luis Fernández',
        content: 'Todo bien, ¿y tú?',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        isRead: true
      },
      {
        id: 'm3',
        conversationId: 'c1',
        senderId: 'u1',
        senderName: 'Ana García',
        content: '¿Vas a la reunión de las 3?',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
        isRead: true
      }
    ],
    c2: [
      {
        id: 'm10',
        conversationId: 'c2',
        senderId: 'u3',
        senderName: 'María López',
        content: 'Adjunté el documento de requisitos.',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isRead: true
      },
      {
        id: 'm11',
        conversationId: 'c2',
        senderId: 'u4',
        senderName: 'Jorge Pérez',
        content: 'Perfecto, lo reviso y les comento.',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        isRead: true
      }
    ]
  };
  
  constructor(
    private chatApiService: ChatApiService,
    private chatSignalRService: ChatSignalRService
  ) {
    super();
  }

  getCurrentUser(): Observable<ChatUser> {
    return this.chatApiService.getCurrentUser().pipe(
      map(entity => ChatAdapter.toUser(entity))
    );
  }

  updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy'): Observable<void> {
    return this.chatApiService.updateUserStatus(status);
  }

  getConversations(): Observable<Conversation[]> {
    return this.chatApiService.getConversations().pipe(
      map(entities => entities.map(entity => ChatAdapter.toConversation(entity))),
      catchError(() => of(this.MOCK_CONVERSATIONS)),
      map(convs => convs && convs.length ? convs : this.MOCK_CONVERSATIONS)
    );
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.chatApiService.getConversation(conversationId).pipe(
      map(entity => ChatAdapter.toConversation(entity))
    );
  }

  createConversation(participants: string[], name?: string): Observable<Conversation> {
    return this.chatApiService.createConversation({ 
      participante_ids: participants, 
      cConversacionesChatNombre: name || '',
      cConversacionesChatTipo: participants.length > 2 ? 'group' : 'individual'
    }).pipe(
      map(entity => ChatAdapter.toConversation(entity))
    );
  }

  updateConversation(conversationId: string, updates: Partial<Conversation>): Observable<Conversation> {
    return this.chatApiService.updateConversation(conversationId, updates).pipe(
      map(entity => ChatAdapter.toConversation(entity))
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.chatApiService.deleteConversation(conversationId);
  }

  joinConversation(conversationId: string): Observable<void> {
    return new Observable(observer => {
      this.chatSignalRService.joinConversation(conversationId)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  leaveConversation(conversationId: string): Observable<void> {
    return new Observable(observer => {
      this.chatSignalRService.leaveConversation(conversationId)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  getMessages(conversationId: string, page?: number, limit?: number): Observable<ChatMessage[]> {
    return this.chatApiService.getMessages(conversationId, page, limit).pipe(
      map(entities => entities.map(entity => ChatAdapter.toMessage(entity))),
      catchError(() => of(this.MOCK_MESSAGES[conversationId] || [])),
      map(messages => messages && messages.length ? messages : (this.MOCK_MESSAGES[conversationId] || []))
    );
  }

  sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' | 'audio' = 'text'): Observable<ChatMessage> {
    // Use SignalR for real-time message sending
    return from(this.chatSignalRService.sendMessage(conversationId, content, type.toUpperCase()));
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.chatApiService.markMessageAsRead(messageId);
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    return this.chatApiService.markConversationAsRead(conversationId);
  }

  getMessageStatus(messageId: string): Observable<any> {
    return this.chatApiService.getMessageStatus(messageId);
  }

  getContacts(): Observable<ChatUser[]> {
    return this.chatApiService.getContacts().pipe(
      map(entities => entities.map(entity => ChatAdapter.toUser(entity)))
    );
  }

  searchContacts(query: string): Observable<ChatUser[]> {
    return this.chatApiService.searchContacts(query).pipe(
      map(entities => entities.map(entity => ChatAdapter.toUser(entity)))
    );
  }

  sendContactRequest(userId: string, message?: string): Observable<void> {
    return this.chatApiService.sendContactRequest({ userId, message });
  }

  getContactRequests(): Observable<ChatUser[]> {
    return this.chatApiService.getContactRequests().pipe(
      map(entities => entities.map(entity => ChatAdapter.toUser(entity)))
    );
  }

  respondToContactRequest(userId: string, accept: boolean): Observable<void> {
    return this.chatApiService.respondToContactRequest({ userId, accept });
  }

  removeContact(contactId: string): Observable<void> {
    return this.chatApiService.removeContact(contactId);
  }

  startTyping(conversationId: string): Observable<void> {
    return new Observable(observer => {
      this.chatSignalRService.startTyping(conversationId)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  stopTyping(conversationId: string): Observable<void> {
    return new Observable(observer => {
      this.chatSignalRService.stopTyping(conversationId)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }
}
