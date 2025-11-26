import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatMessage } from '../models/chat.model';
import { BaseUseCase } from './base.use-case';

export interface SendMessageParams {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'audio';
}

@Injectable({
  providedIn: 'root'
})
export class SendMessageUseCase extends BaseUseCase<SendMessageParams, ChatMessage> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(params: SendMessageParams): Observable<ChatMessage> {
    return this.buildUseCaseObservable(params);
  }

  protected buildUseCaseObservable(params: SendMessageParams): Observable<ChatMessage> {
    return this.chatRepository.sendMessage(params.conversationId, params.content, params.type);
  }
}
