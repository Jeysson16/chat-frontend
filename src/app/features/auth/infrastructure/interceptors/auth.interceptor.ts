import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthTokensService } from '../services/auth-tokens.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private authTokensService: AuthTokensService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      const authReq = this.addToken(req, token);
      return next.handle(authReq).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            return this.handle401Error(req, next);
          } else {
            return throwError(error);
          }
        })
      );
    }
    
    return next.handle(req);
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authTokensService.checkAndRefreshTokens().pipe(
        switchMap((refreshSuccess: boolean) => {
          this.isRefreshing = false;
          
          if (refreshSuccess) {
            // Token refreshed successfully, retry the original request
            const newToken = this.authService.getToken();
            if (newToken) {
              this.refreshTokenSubject.next(true);
              return next.handle(this.addToken(request, newToken));
            }
          }
          
          // Refresh failed, redirect to login
          this.authService.clearAuthData();
          this.refreshTokenSubject.next(false);
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.clearAuthData();
          this.refreshTokenSubject.next(false);
          return throwError(() => error);
        })
      );
    } else {
      // If already refreshing, wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(result => result !== null),
        take(1),
        switchMap((refreshResult) => {
          if (refreshResult === true) {
            const newToken = this.authService.getToken();
            if (newToken) {
              return next.handle(this.addToken(request, newToken));
            }
          }
          return throwError(() => new Error('No token available after refresh'));
        })
      );
    }
  }
}