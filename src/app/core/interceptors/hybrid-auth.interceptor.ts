import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthTokensService } from '../../features/auth/infrastructure/services/auth-tokens.service';
import { AuthService } from '../../features/auth/infrastructure/services/auth.service';

/**
 * Interceptor híbrido que maneja tanto tokens JWT de usuario como tokens de aplicación
 */
@Injectable()
export class HybridAuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authTokensService: AuthTokensService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token injection for auth endpoints to avoid circular dependencies
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add auth headers to the request
    const authRequest = this.addAuthHeaders(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          return this.handle401Error(authRequest, next);
        }

        // Handle 403 Forbidden errors
        if (error.status === 403) {
          return this.handle403Error(error);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * Add authentication headers to the request
   */
  private addAuthHeaders(request: HttpRequest<any>): HttpRequest<any> {
    let headers: { [key: string]: string } = {
      'content-type': 'application/json'
    };

    // Determinar qué tipo de autenticación usar basado en la URL
    if (this.isChatEndpoint(request.url)) {
      // Para endpoints de chat, usar JWT de usuario
      const userToken = this.authService.getToken();
      console.log('HybridAuthInterceptor: Chat endpoint detected:', request.url);
      console.log('HybridAuthInterceptor: User token found:', !!userToken);
      console.log('HybridAuthInterceptor: Token preview:', userToken ? userToken.substring(0, 20) + '...' : 'none');
      if (userToken) {
        headers['authorization'] = `Bearer ${userToken}`;
        console.log('HybridAuthInterceptor: Authorization header added:', headers['authorization'].substring(0, 30) + '...');
      }

      // También agregar información de la aplicación desde localStorage
      const appInfo = this.getAppInfoFromStorage();
      if (appInfo) {
        headers['x-app-code'] = appInfo.appCode || appInfo.code || '';
        if (appInfo.id) headers['x-app-id'] = appInfo.id.toString();
        // No longer send access/secret tokens - JWT authentication only
      }

      // Agregar información del usuario desde localStorage para SignalR
      const userInfo = this.getUserInfoFromStorage();
      if (userInfo) {
        headers['x-user-code'] = userInfo.userCode || userInfo.cPerCodigo || '';
        headers['x-user-id'] = userInfo.id?.toString() || '';
        headers['x-person-code'] = userInfo.personCode || userInfo.cPerJurCodigo || '';
      }
    } else {
      // Para otros endpoints, usar tokens de aplicación
      const authHeaders = this.authTokensService.getAuthHeaders();
      const authValue = authHeaders.get('Authorization') || authHeaders.get('authorization');
      const appCode = authHeaders.get('X-App-Code') || authHeaders.get('x-app-code');
      
      if (authValue) headers['authorization'] = authValue;
      if (appCode) headers['x-app-code'] = appCode;
    }

    // Clone the request and add headers
    return request.clone({ setHeaders: headers });
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('HybridAuthInterceptor: Handling 401 error for:', request.url);
    
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Si es un endpoint de chat, intentar validar el token de usuario
      if (this.isChatEndpoint(request.url)) {
        console.log('HybridAuthInterceptor: 401 on chat endpoint');
        const userToken = this.authService.getToken();
        console.log('HybridAuthInterceptor: User token for retry:', !!userToken);
        
        if (userToken) {
          // Token de usuario existe, reintentamos la petición
          console.log('HybridAuthInterceptor: Retrying with existing token');
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          return next.handle(this.addAuthHeaders(request));
        } else {
          // No hay token de usuario, redirigir al login
          console.log('HybridAuthInterceptor: No user token found, redirecting to login');
          this.redirectToLogin();
          return throwError(() => new Error('Token de usuario no encontrado'));
        }
      } else {
        // Para otros endpoints, usar la lógica de tokens de aplicación
        return this.authTokensService.areCurrentTokensValid().pipe(
          switchMap((isValid: boolean) => {
            if (isValid) {
              // Tokens are valid, retry the request
              this.isRefreshing = false;
              this.refreshTokenSubject.next(true);
              return next.handle(this.addAuthHeaders(request));
            } else {
              // Tokens are invalid, clear them and redirect to login
              this.authTokensService.clearCurrentTokens();
              this.redirectToLogin();
              return throwError(() => new Error('Token inválido o expirado'));
            }
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authTokensService.clearCurrentTokens();
            this.redirectToLogin();
            return throwError(() => error);
          }),
          finalize(() => {
            this.isRefreshing = false;
          })
        );
      }
    } else {
      // If already refreshing, wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap(() => next.handle(this.addAuthHeaders(request)))
      );
    }
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handle403Error(error: HttpErrorResponse): Observable<never> {
    console.error('Access forbidden:', error.error?.message || 'Insufficient permissions');
    return throwError(() => error);
  }

  /**
   * Check if the request URL is an auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/api/auth/generar-tokens',
      '/api/auth/validar-token',
      '/api/auth/renovar-tokens',
      '/api/auth/revocar-tokens',
      '/api/auth/tokens-aplicacion',
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/logout'
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Check if the request URL is a chat endpoint
   */
  private isChatEndpoint(url: string): boolean {
    const chatEndpoints = [
      '/api/chat',
      '/api/chat-modern',
      '/api/v1/contactos',
      '/api/v1/aplicaciones',
      '/api/v1/empresas',
      '/api/v1/configuracion-empresa',
      '/api/v1/configuracion-aplicacion'
    ];

    return chatEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get app info from localStorage or sessionStorage
   */
  private getAppInfoFromStorage(): any {
    try {
      // Try localStorage first, then sessionStorage as fallback
      const appInfo = localStorage.getItem('application') || sessionStorage.getItem('application');
      return appInfo ? JSON.parse(appInfo) : null;
    } catch (error) {
      console.error('Error parsing app info from storage:', error);
      return null;
    }
  }

  /**
   * Get user info from localStorage or sessionStorage
   */
  private getUserInfoFromStorage(): any {
    try {
      // Try localStorage first, then sessionStorage as fallback
      const userInfo = localStorage.getItem('user') || sessionStorage.getItem('user');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing user info from storage:', error);
      return null;
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    // Clear any stored tokens
    this.authTokensService.clearCurrentTokens();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('application');
    
    // Navigate to login page
    this.router.navigate(['/auth/sign-in'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}
