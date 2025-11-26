import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatRepository } from '../../domain/repositories/chat.repository';
import { 
  ChatUser, 
  ChatMessage, 
  ChatConversation, 
  CreateChatMessageDto,
  CreateConversationDto,
  SearchContactDto,
  ConversationPreview,
  UpdateConversationDto,
  ContactRequest,
  CreateContactRequestDto,
  RespondToContactRequestDto,
  MessageStatus,
  Contact
} from '../../domain/entities';
import { ChatApiServiceNew } from '../services/chat-api-service';
import { ChatDataAdapterNew } from '../adapters/chat-data-adapter-new';

/**
 * Implementación del repositorio de chat usando la nueva arquitectura
 * Basado en: Chat_Backend_Architecture_Refactor.md
 * Utiliza ChatApiServiceNew y ChatDataAdapterNew con nomenclatura camelCase
 */
@Injectable({
  providedIn: 'root'
})
export class ChatRepositoryNewImpl extends ChatRepository {
  constructor(
    private chatApiServiceNew: ChatApiServiceNew,
    private chatDataAdapterNew: ChatDataAdapterNew
  ) {
    super();
  }

  getCurrentUser(): Observable<ChatUser> {
    return this.chatApiServiceNew.getCurrentUser().pipe(
      map(dto => this.chatDataAdapterNew.adaptChatUser(dto))
    );
  }

  updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy'): Observable<void> {
    const isOnline = status === 'online';
    return this.chatApiServiceNew.updateOnlineStatus(isOnline);
  }

  getConversations(): Observable<ConversationPreview[]> {
    return this.chatApiServiceNew.getConversations().pipe(
      map(dtos => this.chatDataAdapterNew.adaptConversationList(dtos))
    );
  }

  getConversation(conversationId: string): Observable<ChatConversation> {
    // Note: This method might need to be implemented in the API service
    // For now, we'll throw an error to indicate it's not implemented
    throw new Error('getConversation method not implemented in new API service');
  }

  createConversation(dto: CreateConversationDto): Observable<ChatConversation> {
    const backendDto = this.chatDataAdapterNew.adaptCreateConversationToBackend(dto);
    return this.chatApiServiceNew.createConversation(backendDto).pipe(
      map(responseDto => this.chatDataAdapterNew.adaptChatConversation(responseDto))
    );
  }

  updateConversation(conversationId: string, dto: UpdateConversationDto): Observable<ChatConversation> {
    // Note: This method might need to be implemented in the API service
    throw new Error('updateConversation method not implemented in new API service');
  }

  deleteConversation(conversationId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('deleteConversation method not implemented in new API service');
  }

  joinConversation(conversationId: number): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('joinConversation method not implemented in new API service');
  }

  leaveConversation(conversationId: number): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('leaveConversation method not implemented in new API service');
  }

  getMessages(conversationId: number, page?: number, limit?: number): Observable<ChatMessage[]> {
    return this.chatApiServiceNew.getMessages(conversationId, limit || 50, page || 1).pipe(
      map(dtos => this.chatDataAdapterNew.adaptMessageList(dtos))
    );
  }

  sendMessage(dto: CreateChatMessageDto): Observable<ChatMessage> {
    const backendDto = this.chatDataAdapterNew.adaptCreateMessageToBackend(dto);
    return this.chatApiServiceNew.sendMessage(backendDto).pipe(
      map(responseDto => this.chatDataAdapterNew.adaptChatMessage(responseDto))
    );
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('markConversationAsRead method not implemented in new API service');
  }

  markMessageAsRead(messageId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('markMessageAsRead method not implemented in new API service');
  }

  getMessageStatus(messageId: string): Observable<MessageStatus> {
    // Note: This method might need to be implemented in the API service
    throw new Error('getMessageStatus method not implemented in new API service');
  }

  getContacts(): Observable<ChatUser[]> {
    // Note: This method might need to be implemented in the API service
    throw new Error('getContacts method not implemented in new API service');
  }

  searchContacts(dto: SearchContactDto): Observable<ChatUser[]> {
    return this.chatApiServiceNew.searchContacts(dto.query).pipe(
      map(dtos => dtos.map(userDto => this.chatDataAdapterNew.adaptChatUser(userDto)))
    );
  }

  sendContactRequest(dto: CreateContactRequestDto): Observable<ContactRequest> {
    // Note: This method might need to be implemented in the API service
    throw new Error('sendContactRequest method not implemented in new API service');
  }

  respondToContactRequest(dto: RespondToContactRequestDto): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('respondToContactRequest method not implemented in new API service');
  }

  getContactRequests(): Observable<ContactRequest[]> {
    // Note: This method might need to be implemented in the API service
    throw new Error('getContactRequests method not implemented in new API service');
  }

  removeContact(contactId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('removeContact method not implemented in new API service');
  }

  startTyping(conversationId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('startTyping method not implemented in new API service');
  }

  stopTyping(conversationId: string): Observable<void> {
    // Note: This method might need to be implemented in the API service
    throw new Error('stopTyping method not implemented in new API service');
  }

  /**
   * Helper method to create or update a user in the chat system
   */
  createOrUpdateUser(user: {
    userName: string;
    userEmail?: string;
    userAvatar?: string;
  }): Observable<ChatUser> {
    return this.chatApiServiceNew.createOrUpdateUser(user).pipe(
      map(dto => this.chatDataAdapterNew.adaptChatUser(dto))
    );
  }

  /**
   * Método auxiliar para obtener contactos con búsqueda
   */
  searchContactsNew(searchTerm: string = ''): Observable<Contact[]> {
    return this.chatApiServiceNew.searchContacts(searchTerm).pipe(
      map(dtos => this.chatDataAdapterNew.adaptContactList(dtos))
    );
  }
}