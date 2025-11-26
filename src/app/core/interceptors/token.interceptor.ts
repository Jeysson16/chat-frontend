import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthTokensService } from '../../features/auth/infrastructure/services/auth-tokens.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authTokensService: AuthTokensService,
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
    const authHeaders = this.authTokensService.getAuthHeaders();
    
    // Clone the request and add headers
    return request.clone({
      setHeaders: {
        'Authorization': authHeaders.get('Authorization') || '',
        'X-App-Code': authHeaders.get('X-App-Code') || '',
        'Content-Type': authHeaders.get('Content-Type') || 'application/json'
      }
    });
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Try to validate current tokens
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
    
    // You might want to show a specific error message or redirect to a different page
    // For now, we'll just pass the error through
    return throwError(() => error);
  }

  /**
   * Check if the request URL is an auth endpoint
   */
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/api/v1/auth/generar-tokens-aplicacion',
      '/api/v1/auth/validar-access-token',
      '/api/v1/auth/renovar-tokens',
      '/api/v1/auth/revocar-tokens',
      '/api/v1/auth/tokens-aplicacion',
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/status'
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    // Clear any stored tokens
    this.authTokensService.clearCurrentTokens();
    
    // Navigate to login page
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
  }
}