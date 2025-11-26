import { Observable } from 'rxjs';
import { User, AuthResult, LoginCredentials, RegisterData } from '../models/application.model';

export interface IAuthService {
  login(credentials: LoginCredentials, rememberMe?: boolean): Observable<AuthResult>;
  logout(): Observable<void>;
  register(data: RegisterData): Observable<AuthResult>;
  getCurrentUser(): Observable<User | null>;
  isAuthenticated(): Observable<boolean>;
  getCurrentUserValue(): User | null;
  updateProfile(user: Partial<User>): Observable<User>;
  changePassword(currentPassword: string, newPassword: string): Observable<void>;
}