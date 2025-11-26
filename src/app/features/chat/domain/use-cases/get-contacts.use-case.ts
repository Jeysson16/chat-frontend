import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRepository } from '../repositories';
import { ChatUser } from '../entities';
import { BaseUseCase } from './base.use-case';

@Injectable({
  providedIn: 'root'
})
export class GetContactsUseCase extends BaseUseCase<void, ChatUser[]> {
  constructor(private chatRepository: ChatRepository) {
    super();
  }

  execute(): Observable<ChatUser[]> {
    return this.buildUseCaseObservable();
  }

  protected buildUseCaseObservable(): Observable<ChatUser[]> {
    return this.chatRepository.getContacts();
  }
}