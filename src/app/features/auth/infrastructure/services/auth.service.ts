import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Domain Models
import { Application, AuthResult, LoginCredentials, RegisterData, User } from '../../domain/models/application.model';

// Infrastructure
import { AuthenticationAdapter } from '../adapters/authentication-adapter';
import { RegisterAdapter } from '../adapters/register-adapter';
import { BackendAuthResponse } from '../interfaces/backend-auth-response.interface';
import { AuthTokensService } from './auth-tokens.service';

// Repository Interface
import { IAuthService } from '../../domain/interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements IAuthService {
  private readonly apiUrl = (import.meta.env.NG_APP_API_URL as string) || 'http://localhost:5406/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentApplicationSubject = new BehaviorSubject<Application | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentApplication$ = this.currentApplicationSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private authTokensService: AuthTokensService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    const storedApplication = localStorage.getItem('application');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        const application = storedApplication ? JSON.parse(storedApplication) as Application : null;
        
        this.currentUserSubject.next(user);
        this.currentApplicationSubject.next(application);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        this.clearAuthData();
      }
    } else if (token) {
      // Si solo hay token pero no datos, obtener del servidor
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.clearAuthData()
      });
    }
  }

  login(credentials: LoginCredentials, rememberMe: boolean = false): Observable<AuthResult> {
    console.log('AuthService.login called with credentials:', credentials);
    
    // Obtener información de la aplicación del localStorage
    const storedApp = localStorage.getItem('application');
    const appInfo = storedApp ? JSON.parse(storedApp) : null;
    console.log('Stored app info:', appInfo);
    
    // Obtener tokens de aplicación desde variables de entorno
    const accessToken = `${import.meta.env['NG_APP_ACCESS_TOKEN']}` || '';
    const secretToken = `${import.meta.env['NG_APP_SECRET_TOKEN']}` || '';
    
    console.log('Using access token:', accessToken ? 'present' : 'missing');
    console.log('Using secret token:', secretToken ? 'present' : 'missing');
    
    const loginRequest = {
      cUsuarioCodigo: credentials.userCode,
      cUsuarioContra: credentials.password,
      bRecordarme: rememberMe,
      cTokenAcceso: accessToken,
      cTokenSecreto: secretToken,
      cPerJurCodigo: import.meta.env['NG_APP_PER_JUR_CODIGO'] as string ?? 'DEFAULT'
    };

    console.log('Login request payload:', loginRequest);

    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/v1/auth/login`, loginRequest)
      .pipe(
        tap(backendResponse => {
          console.log('Raw backend response:', backendResponse);
        }),
        map(backendResponse => AuthenticationAdapter.toAuthResult(backendResponse)),
        tap(result => {
          console.log('Mapped auth result:', result);
          if (result.success && result.user && result.application) {
            console.log('Saving auth data and updating subjects');
            this.saveAuthData(result, rememberMe);
            this.currentUserSubject.next(result.user);
            this.currentApplicationSubject.next(result.application);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  register(data: RegisterData): Observable<AuthResult> {
    const prefixed = RegisterAdapter.toBackendPayload({
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      name: data.name
    });

    return this.authTokensService.getCurrentTokens().pipe(
      take(1),
      map(tokens => ({
        ...prefixed,
        ...(tokens ? {
          cCodigoAplicacion: tokens.cCodigoAplicacion,
          cTokenAcceso: tokens.cTokenAcceso,
          cTokenSecreto: tokens.cTokenSecreto
        } : {})
      })),
      switchMap(payload => this.http.post<BackendAuthResponse>(`${this.apiUrl}/v1/auth/register`, payload)),
      map(backendResponse => AuthenticationAdapter.toAuthResult(backendResponse)),
      tap(result => {
        if (result.success && result.user && result.application) {
          this.saveAuthData(result, false);
          this.currentUserSubject.next(result.user);
          this.currentApplicationSubject.next(result.application);
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }

  logout(): Observable<void> {
    // Try to refresh tokens before logout to ensure clean logout
    return this.authTokensService.checkAndRefreshTokens().pipe(
      switchMap(() => this.http.post<void>(`${this.apiUrl}/v1/auth/logout`, {})),
      tap(() => this.clearAuthData()),
      catchError(error => {
        console.error('Logout error:', error);
        this.clearAuthData();
        return throwError(() => new Error(error.error?.message || 'Logout failed'));
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }
    
    return this.http.get<User>(`${this.apiUrl}/v1/auth/me`)
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to get current user'));
        })
      );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/v1/auth/profile`, user)
      .pipe(
        tap(updatedUser => {
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }),
        catchError(error => {
          console.error('Update profile error:', error);
          return throwError(() => new Error(error.error?.message || 'Profile update failed'));
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/v1/auth/change-password`, { 
      currentPassword, 
      newPassword 
    }).pipe(
      catchError(error => {
        console.error('Change password error:', error);
        return throwError(() => new Error(error.error?.message || 'Password change failed'));
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    const token = this.getToken();
    if (token) {
      return this.validateToken(token);
    }
    return of(false);
  }

  getToken(): string | null {
    // Buscar primero en localStorage, luego en sessionStorage como fallback
    const localToken = localStorage.getItem('auth_token');
    const sessionToken = sessionStorage.getItem('auth_token');
    
    console.log('AuthService.getToken(): localStorage token:', !!localToken);
    console.log('AuthService.getToken(): sessionStorage token:', !!sessionToken);
    
    if (localToken) {
      console.log('AuthService.getToken(): Returning localStorage token');
      return localToken;
    }
    
    console.log('AuthService.getToken(): Returning sessionStorage token');
    return sessionToken;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentApplication(): Application | null {
    return this.currentApplicationSubject.value;
  }

  private saveAuthData(result: AuthResult, rememberMe: boolean): void {
    if (result.user && result.application) {
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('application', JSON.stringify(result.application));
      
      if (rememberMe) {
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
      } else {
        if (result.token) {
          sessionStorage.setItem('auth_token', result.token);
        }
      }
    }
  }

  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    sessionStorage.removeItem('auth_token');
    
    // Clear tokens from the auth tokens service
    this.authTokensService.clearCurrentTokens();
    
    this.currentUserSubject.next(null);
    this.currentApplicationSubject.next(null);
  }

  private validateToken(token: string): Observable<boolean> {
    try {
      if (!token || token.trim() === '') {
        return of(false);
      }

      if (token.includes('.')) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            return of(false);
          }
        } catch {
          return of(false);
        }
      }

      return of(true);
    } catch {
      return of(false);
    }
  }
}
