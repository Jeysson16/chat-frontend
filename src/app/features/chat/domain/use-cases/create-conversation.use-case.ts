import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { Conversation } from '../models/chat.model';
import { BaseUseCase } from './base.use-case';

export interface CreateConversationParams {
  participants: string[];
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateConversationUseCase extends BaseUseCase<CreateConversationParams, Conversation> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(params: CreateConversationParams): Observable<Conversation> {
    return this.buildUseCaseObservable(params);
  }

  protected buildUseCaseObservable(params: CreateConversationParams): Observable<Conversation> {
    return this.chatRepository.createConversation(params.participants, params.name);
  }
}