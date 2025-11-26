import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { Conversation } from '../models/chat.model';
import { BaseUseCase } from './base.use-case';

@Injectable({
  providedIn: 'root'
})
export class GetConversationsUseCase extends BaseUseCase<void, Conversation[]> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(): Observable<Conversation[]> {
    return this.buildUseCaseObservable();
  }

  protected buildUseCaseObservable(): Observable<Conversation[]> {
    return this.chatRepository.getConversations();
  }
}