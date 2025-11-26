import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatMessage } from '../models/chat.model';
import { BaseUseCase } from './base.use-case';

export interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GetMessagesUseCase extends BaseUseCase<GetMessagesParams, ChatMessage[]> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(params: GetMessagesParams): Observable<ChatMessage[]> {
    return this.buildUseCaseObservable(params);
  }

  protected buildUseCaseObservable(params: GetMessagesParams): Observable<ChatMessage[]> {
    return this.chatRepository.getMessages(params.conversationId, params.page, params.limit);
  }
}