import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResult, LoginCredentials, RegisterData, User } from '../../domain/models/application.model';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl extends AuthRepository {
  
  constructor(private authService: AuthService) {
    super();
  }

  login(userCode: string, password: string): Observable<AuthResult> {
    const credentials: LoginCredentials = {
      userCode,
      password
    };
    return this.authService.login(credentials);
  }

  register(email: string, password: string, name: string): Observable<AuthResult> {
    const registerData: RegisterData = {
      email,
      password,
      name,
      confirmPassword: password,
      acceptTerms: true
    };
    return this.authService.register(registerData);
  }

  logout(): Observable<void> {
    return this.authService.logout();
  }

  refreshToken(): Observable<AuthResult> {
    // TODO: Implement refresh token functionality
    throw new Error('refreshToken not implemented');
  }

  getCurrentUser(): Observable<User | null> {
    return this.authService.getCurrentUser();
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.authService.updateProfile(user);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.authService.changePassword(currentPassword, newPassword);
  }

  validateToken(token: string): Observable<boolean> {
    return this.authService.isAuthenticated();
  }

  revokeToken(token: string): Observable<void> {
    return this.authService.logout();
  }
}