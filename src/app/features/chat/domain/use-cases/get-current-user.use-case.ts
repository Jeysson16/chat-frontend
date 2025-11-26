import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UseCase } from './base.use-case';
import { ChatUser } from '../models/chat.model';
import { AuthService } from '../../../auth/infrastructure/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class GetCurrentUserUseCase extends UseCase<void, ChatUser> {
  
  constructor(private authService: AuthService) {
    super();
  }

  execute(): Observable<ChatUser> {
    // Get the current user from the authentication service
    const authUser = this.authService.getCurrentUserValue();
    
    if (authUser) {
      // Convert the authenticated user to ChatUser format
      const chatUser: ChatUser = {
        id: authUser.id,
        name: authUser.name || authUser.username || 'Usuario',
        email: authUser.email,
        avatar: '', // Avatar can be added later if available
        isOnline: true,
        role: authUser.role,
        isActive: true
      };
      
      return of(chatUser);
    }
    
    // Fallback: return a default user if no authenticated user found
    // This should not happen in normal circumstances
    const fallbackUser: ChatUser = {
      id: '1',
      name: 'Usuario',
      email: 'usuario@example.com',
      avatar: '',
      isOnline: true,
      role: 'user',
      isActive: true
    };
    
    return of(fallbackUser);
  }
}