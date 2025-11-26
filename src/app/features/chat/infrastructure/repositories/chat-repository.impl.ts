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
  MessageStatus
} from '../../domain/entities';
import { ChatApiService } from '../services/chat-api.service';
import { ChatDataAdapter } from '../adapters/chat-data.adapter';

@Injectable({
  providedIn: 'root'
})
export class ChatRepositoryImpl extends ChatRepository {
  constructor(
    private chatApiService: ChatApiService,
    private chatDataAdapter: ChatDataAdapter
  ) {
    super();
  }

  getCurrentUser(): Observable<ChatUser> {
    return this.chatApiService.getCurrentUser().pipe(
      map(dto => this.chatDataAdapter.adaptChatUser(dto))
    );
  }

  updateUserStatus(status: 'online' | 'offline' | 'away' | 'busy'): Observable<void> {
    return this.chatApiService.updateUserStatus(status);
  }

  getConversations(): Observable<ConversationPreview[]> {
    return this.chatApiService.getConversations().pipe(
      map(dtos => dtos.map(dto => this.chatDataAdapter.adaptConversationPreview(dto)))
    );
  }

  getConversation(conversationId: string): Observable<ChatConversation> {
    return this.chatApiService.getConversation(conversationId).pipe(
      map(dto => this.chatDataAdapter.adaptChatConversation(dto))
    );
  }

  createConversation(dto: CreateConversationDto): Observable<ChatConversation> {
    return this.chatApiService.createConversation(
      this.chatDataAdapter.adaptCreateConversationToBackend(dto)
    ).pipe(
      map(responseDto => this.chatDataAdapter.adaptChatConversation(responseDto))
    );
  }

  updateConversation(conversationId: string, dto: UpdateConversationDto): Observable<ChatConversation> {
    return this.chatApiService.updateConversation(conversationId, dto).pipe(
      map(responseDto => this.chatDataAdapter.adaptChatConversation(responseDto))
    );
  }

  deleteConversation(conversationId: string): Observable<void> {
    return this.chatApiService.deleteConversation(conversationId);
  }

  joinConversation(conversationId: number): Observable<void> {
    return this.chatApiService.joinConversation(conversationId.toString());
  }

  leaveConversation(conversationId: number): Observable<void> {
    return this.chatApiService.leaveConversation(conversationId.toString());
  }

  getMessages(conversationId: string, page?: number, limit?: number): Observable<ChatMessage[]> {
    return this.chatApiService.getMessages(conversationId, page, limit).pipe(
      map(dtos => dtos.map(dto => this.chatDataAdapter.adaptChatMessage(dto)))
    );
  }

  sendMessage(dto: CreateChatMessageDto): Observable<ChatMessage> {
    return this.chatApiService.sendMessage(
      this.chatDataAdapter.adaptCreateMessageToBackend(dto)
    ).pipe(
      map(responseDto => this.chatDataAdapter.adaptChatMessage(responseDto))
    );
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    return this.chatApiService.markConversationAsRead(conversationId);
  }

  markMessageAsRead(messageId: string): Observable<void> {
    return this.chatApiService.markMessageAsRead(messageId);
  }

  getMessageStatus(messageId: string): Observable<MessageStatus> {
    return this.chatApiService.getMessageStatus(messageId);
  }

  getContacts(): Observable<ChatUser[]> {
    return this.chatApiService.getContacts().pipe(
      map(dtos => dtos.map(dto => this.chatDataAdapter.adaptChatUser(dto)))
    );
  }

  searchContacts(dto: SearchContactDto): Observable<ChatUser[]> {
    return this.chatApiService.searchContacts(dto.query, dto.companyId, dto.applicationId).pipe(
      map(dtos => dtos.map(dto => this.chatDataAdapter.adaptChatUser(dto)))
    );
  }

  sendContactRequest(dto: CreateContactRequestDto): Observable<ContactRequest> {
    return this.chatApiService.sendContactRequest(dto);
  }

  getContactRequests(): Observable<ContactRequest[]> {
    return this.chatApiService.getContactRequests();
  }

  respondToContactRequest(dto: RespondToContactRequestDto): Observable<void> {
    return this.chatApiService.respondToContactRequest(dto);
  }

  removeContact(contactId: string): Observable<void> {
    return this.chatApiService.removeContact(contactId);
  }

  startTyping(conversationId: string): Observable<void> {
    return this.chatApiService.startTyping(conversationId);
  }

  stopTyping(conversationId: string): Observable<void> {
    return this.chatApiService.stopTyping(conversationId);
  }
}