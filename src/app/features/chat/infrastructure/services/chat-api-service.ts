import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatConversationDtoNew,
  ChatMessageDtoNew,
  ChatUserDtoNew,
  CreateChatConversationRequestDtoNew,
  CreateChatMessageRequestDtoNew
} from '../adapters/chat-data-adapter-new';

/**
 * Restructured API service for the chat system
 * Based on: Chat_Backend_Architecture_Refactor.md
 * Uses the new camelCase nomenclature and restructured endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ChatApiServiceNew {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5405/api'}/chat`;

  constructor(private http: HttpClient) {}

  /**
   * Gets conversations for the authenticated user
   */
  getConversations(): Observable<ChatConversationDtoNew[]> {
    return this.http.get<ChatConversationDtoNew[]>(`${this.baseUrl}/conversations`);
  }

  /**
   * Gets messages from a specific conversation
   * @param conversationId Conversation ID
   * @param pageSize Page size (optional, default: 50)
   * @param pageNumber Page number (optional, default: 1)
   */
  getMessages(
    conversationId: number, 
    pageSize: number = 50, 
    pageNumber: number = 1
  ): Observable<ChatMessageDtoNew[]> {
    let params = new HttpParams()
      .set('pageSize', pageSize.toString())
      .set('pageNumber', pageNumber.toString());

    return this.http.get<ChatMessageDtoNew[]>(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      { params }
    );
  }

  /**
   * Sends a new message to a conversation
   * @param message Message data to send
   */
  sendMessage(message: CreateChatMessageRequestDtoNew): Observable<ChatMessageDtoNew> {
    return this.http.post<ChatMessageDtoNew>(`${this.baseUrl}/messages`, message);
  }

  /**
   * Searches for contacts to start conversations
   * @param searchTerm Search term (optional)
   */
  searchContacts(searchTerm: string = ''): Observable<ChatUserDtoNew[]> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<ChatUserDtoNew[]>(`${this.baseUrl}/contacts/search`, { params });
  }

  /**
   * Creates a new conversation
   * @param conversation Conversation data to create
   */
  createConversation(conversation: CreateChatConversationRequestDtoNew): Observable<ChatConversationDtoNew> {
    return this.http.post<ChatConversationDtoNew>(`${this.baseUrl}/conversations`, conversation);
  }

  /**
   * Updates the user's online status
   * @param isOnline Online status to set
   */
  updateOnlineStatus(isOnline: boolean): Observable<any> {
    const request = { isOnline };
    return this.http.put(`${this.baseUrl}/users/online-status`, request);
  }

  /**
   * Gets current user information
   */
  getCurrentUser(): Observable<ChatUserDtoNew> {
    return this.http.get<ChatUserDtoNew>(`${this.baseUrl}/users/me`);
  }

  /**
   * Creates or updates user information in the chat system
   * @param user User data
   */
  createOrUpdateUser(user: {
    userName: string;
    userEmail?: string;
    userAvatar?: string;
  }): Observable<ChatUserDtoNew> {
    return this.http.post<ChatUserDtoNew>(`${this.baseUrl}/users`, user);
  }

  // Helper methods for error handling and logging

  /**
   * Método auxiliar para construir parámetros HTTP
   */
  private buildHttpParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    
    return httpParams;
  }

  /**
   * Método auxiliar para validar IDs
   */
  private validateId(id: number | string, fieldName: string): void {
    if (!id || (typeof id === 'number' && id <= 0) || (typeof id === 'string' && id.trim() === '')) {
      throw new Error(`${fieldName} is required and must be valid`);
    }
  }

  /**
   * Helper method to validate message text
   */
  private validateMessageText(text: string): void {
    if (!text || text.trim() === '') {
      throw new Error('Message text is required');
    }
    
    if (text.length > 4000) {
      throw new Error('Message cannot exceed 4000 characters');
    }
  }

  /**
   * Helper method to validate conversation data
   */
  private validateConversationData(conversation: CreateChatConversationRequestDtoNew): void {
    if (conversation.cconversacioneschattype === 'group' && (!conversation.cconversacioneschatname || conversation.cconversacioneschatname.trim() === '')) {
      throw new Error('Conversation name is required for groups');
    }
    
    if (!conversation.cparticipantids || conversation.cparticipantids.length === 0) {
      throw new Error('At least one participant is required');
    }
    
    if (!conversation.ncompanyid || !conversation.napplicationid) {
      throw new Error('Company ID and Application ID are required');
    }
  }

  /**
   * Helper method to validate user data
   */
  private validateUserData(user: { userName: string; userEmail?: string; userAvatar?: string }): void {
    if (!user.userName || user.userName.trim() === '') {
      throw new Error('User name is required');
    }
    
    if (user.userName.length > 255) {
      throw new Error('User name cannot exceed 255 characters');
    }
    
    if (user.userEmail && !this.isValidEmail(user.userEmail)) {
      throw new Error('Email format is invalid');
    }
  }

  /**
   * Helper method to validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper method to format API errors
   */
  private formatApiError(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Unknown API error';
  }

  /**
   * Helper method for request logging
   */
  private logRequest(method: string, url: string, data?: any): void {
    const isProduction = import.meta.env.NODE_ENV === 'production';
    if (isProduction) return;
    
    console.log(`[ChatApiServiceNew] ${method} ${url}`, data || '');
  }

  /**
   * Helper method for response logging
   */
  private logResponse(method: string, url: string, response: any): void {
    const isProduction = import.meta.env.NODE_ENV === 'production';
    if (isProduction) return;
    
    console.log(`[ChatApiServiceNew] ${method} ${url} - Response:`, response);
  }

  /**
   * Helper method for error logging
   */
  private logError(method: string, url: string, error: any): void {
    console.error(`[ChatApiServiceNew] ${method} ${url} - Error:`, error);
  }
}
