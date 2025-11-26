import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatUser } from '../models/chat.model';
import { BaseUseCase } from './base.use-case';

@Injectable({
  providedIn: 'root'
})
export class SearchContactsUseCase extends BaseUseCase<string, ChatUser[]> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(query: string): Observable<ChatUser[]> {
    return this.buildUseCaseObservable(query);
  }

  protected buildUseCaseObservable(query: string): Observable<ChatUser[]> {
    return this.chatRepository.searchContacts(query);
  }
}