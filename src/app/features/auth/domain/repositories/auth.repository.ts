import { Observable } from 'rxjs';
import { User } from '../models/application.model';
import { AuthResult } from '../models/application.model';

export abstract class AuthRepository {
  // Authentication methods
  abstract login(userCode: string, password: string): Observable<AuthResult>;
  abstract register(email: string, password: string, name: string): Observable<AuthResult>;
  abstract logout(): Observable<void>;
  abstract refreshToken(): Observable<AuthResult>;
  
  // User profile methods
  abstract getCurrentUser(): Observable<User | null>;
  abstract updateProfile(user: Partial<User>): Observable<User>;
  abstract changePassword(currentPassword: string, newPassword: string): Observable<void>;
  
  // Token management
  abstract validateToken(token: string): Observable<boolean>;
  abstract revokeToken(token: string): Observable<void>;
}