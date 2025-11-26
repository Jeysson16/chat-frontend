import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, timer } from 'rxjs';
import { catchError, map, tap, switchMap, retry } from 'rxjs/operators';

export interface TokenData {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
  cTokenSecreto: string;
  dFechaExpiracion: Date;
  bEsActivo: boolean;
}

export interface GenerarTokensRequest {
  cCodigoAplicacion: string;
  nDiasValidez: number;
}

export interface ValidarTokenRequest {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
}

export interface ValidacionTokenResponse {
  bEsValido: boolean;
  cMensaje: string;
  dFechaExpiracion?: Date;
  nDiasRestantes?: number;
}

export interface RenovarTokensRequest {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
  nNuevosDiasValidez: number;
}

export interface RevocarTokensRequest {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
}

export interface TokensAplicacionResponse {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
  cTokenSecreto: string;
  dFechaExpiracion: Date;
  bEsActivo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthTokensService {
  private readonly apiUrl = `${import.meta.env.NG_APP_API_URL}/v1/auth`;
  private readonly tokenValidationInterval = 50 * 60 * 1000; // 5 minutes
  private readonly tokenRefreshThreshold = 24 * 60 * 60 * 1000; // 24 hours before expiration
  
  private currentTokens$ = new BehaviorSubject<TokenData | null>(null);
  private tokenValidationTimer$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeTokenValidation();
  }

  /**
   * Get current tokens observable
   */
  getCurrentTokens(): Observable<TokenData | null> {
    return this.currentTokens$.asObservable();
  }

  /**
   * Generate new tokens for an application
   */
  generarTokensAplicacion(request: GenerarTokensRequest): Observable<TokensAplicacionResponse> {
    return this.http.post<any>(`${this.apiUrl}/generar-tokens-aplicacion`, request)
      .pipe(
        map(response => {
          const tokens = response?.item ?? response?.data ?? response;
          return {
            cCodigoAplicacion: tokens.cCodigoAplicacion,
            cTokenAcceso: tokens.cTokenAcceso,
            cTokenSecreto: tokens.cTokenSecreto,
            dFechaExpiracion: tokens.dFechaExpiracion,
            bEsActivo: tokens.bEsActivo
          } as TokensAplicacionResponse;
        }),
        tap(tokens => {
          const tokenData: TokenData = {
            cCodigoAplicacion: tokens.cCodigoAplicacion,
            cTokenAcceso: tokens.cTokenAcceso,
            cTokenSecreto: tokens.cTokenSecreto,
            dFechaExpiracion: new Date(tokens.dFechaExpiracion),
            bEsActivo: tokens.bEsActivo
          };
          this.currentTokens$.next(tokenData);
          this.saveTokensToStorage(tokenData);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Validate an access token
   */
  validarAccessToken(request: ValidarTokenRequest): Observable<ValidacionTokenResponse> {
    return this.http.post<any>(`${this.apiUrl}/validar-access-token`, request)
      .pipe(
        map(response => (response?.item ?? response?.data ?? response) as ValidacionTokenResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Renew existing tokens
   */
  renovarTokens(request: RenovarTokensRequest): Observable<TokensAplicacionResponse> {
    return this.http.post<any>(`${this.apiUrl}/renovar-tokens`, request)
      .pipe(
        map(response => {
          const tokens = response?.item ?? response?.data ?? response;
          return {
            cCodigoAplicacion: tokens.cCodigoAplicacion,
            cTokenAcceso: tokens.cTokenAcceso,
            cTokenSecreto: tokens.cTokenSecreto,
            dFechaExpiracion: tokens.dFechaExpiracion,
            bEsActivo: tokens.bEsActivo
          } as TokensAplicacionResponse;
        }),
        tap(tokens => {
          const tokenData: TokenData = {
            cCodigoAplicacion: tokens.cCodigoAplicacion,
            cTokenAcceso: tokens.cTokenAcceso,
            cTokenSecreto: tokens.cTokenSecreto,
            dFechaExpiracion: new Date(tokens.dFechaExpiracion),
            bEsActivo: tokens.bEsActivo
          };
          this.currentTokens$.next(tokenData);
          this.saveTokensToStorage(tokenData);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Revoke tokens
   */
  revocarTokens(request: RevocarTokensRequest): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/revocar-tokens`, request)
      .pipe(
        map(response => response.success),
        tap(success => {
          if (success) {
            this.currentTokens$.next(null);
            this.removeTokensFromStorage();
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get active tokens for an application
   */
  getTokensAplicacion(codigoAplicacion: string): Observable<TokenData[]> {
    return this.http.get<any>(`${this.apiUrl}/tokens-aplicacion/${codigoAplicacion}`)
      .pipe(
        map(response => {
          const raw = Array.isArray(response) ? response : (response?.lstItem ?? response?.data ?? response?.item ?? response?.items ?? []);
          const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
          return list.map((token: any) => ({
            cCodigoAplicacion: token.cCodigoAplicacion,
            cTokenAcceso: token.cTokenAcceso,
            cTokenSecreto: token.cTokenSecreto,
            dFechaExpiracion: new Date(token.dFechaExpiracion),
            bEsActivo: token.bEsActivo
          }));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Set current tokens (for manual token management)
   */
  setCurrentTokens(tokens: TokenData): void {
    this.currentTokens$.next(tokens);
    this.saveTokensToStorage(tokens);
  }

  /**
   * Clear current tokens
   */
  clearCurrentTokens(): void {
    this.currentTokens$.next(null);
    this.removeTokensFromStorage();
  }

  /**
   * Check if current tokens are valid
   */
  areCurrentTokensValid(): Observable<boolean> {
    const currentTokens = this.currentTokens$.value;
    if (!currentTokens) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.validarAccessToken({
      cCodigoAplicacion: currentTokens.cCodigoAplicacion,
      cTokenAcceso: currentTokens.cTokenAcceso
    }).pipe(
      map(validation => validation.bEsValido),
      catchError(() => new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      }))
    );
  }

  /**
   * Get token expiration info
   */
  getTokenExpirationInfo(): { isExpired: boolean; daysRemaining: number; hoursRemaining: number; needsRefresh: boolean } | null {
    const currentTokens = this.currentTokens$.value;
    if (!currentTokens) return null;

    const now = new Date();
    const expiration = new Date(currentTokens.dFechaExpiracion);
    const diffMs = expiration.getTime() - now.getTime();
    
    const isExpired = diffMs <= 0;
    const needsRefresh = diffMs <= this.tokenRefreshThreshold;
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      isExpired,
      needsRefresh,
      daysRemaining: Math.max(0, daysRemaining),
      hoursRemaining: Math.max(0, hoursRemaining)
    };
  }

  /**
   * Start automatic token validation
   */
  startTokenValidation(): void {
    this.tokenValidationTimer$.next(true);
  }

  /**
   * Check and refresh tokens if needed
   */
  checkAndRefreshTokens(): Observable<boolean> {
    const expirationInfo = this.getTokenExpirationInfo();
    
    if (!expirationInfo || !this.currentTokens$.value) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    if (expirationInfo.needsRefresh && !expirationInfo.isExpired) {
      console.log(`Token needs refresh. Days remaining: ${expirationInfo.daysRemaining}, Hours: ${expirationInfo.hoursRemaining}`);
      
      return this.renovarTokens({
        cCodigoAplicacion: this.currentTokens$.value.cCodigoAplicacion,
        cTokenAcceso: this.currentTokens$.value.cTokenAcceso,
        nNuevosDiasValidez: 3 // Refresh for 3 days
      }).pipe(
        map(response => {
          console.log('Token refreshed successfully');
          return true;
        }),
        catchError(error => {
          console.error('Token refresh failed:', error);
          this.clearCurrentTokens();
          return new Observable<boolean>(observer => {
            observer.next(false);
            observer.complete();
          });
        })
      );
    }

    return new Observable<boolean>(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  /**
   * Stop automatic token validation
   */
  stopTokenValidation(): void {
    this.tokenValidationTimer$.next(false);
  }

  /**
   * Get HTTP headers with current access token
   */
  getAuthHeaders(): HttpHeaders {
    const currentTokens = this.currentTokens$.value;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (currentTokens) {
      headers = headers.set('Authorization', `Bearer ${currentTokens.cTokenAcceso}`);
      headers = headers.set('X-App-Code', currentTokens.cCodigoAplicacion);
    }

    return headers;
  }

  /**
   * Initialize token validation timer
   */
  private initializeTokenValidation(): void {
    // Load tokens from storage on service initialization
    this.loadTokensFromStorage();

    // Set up automatic token validation and refresh
    this.tokenValidationTimer$.pipe(
      switchMap(isActive => {
        if (isActive) {
          return timer(0, this.tokenValidationInterval).pipe(
            switchMap(() => {
              // First check if tokens need refresh
              return this.checkAndRefreshTokens().pipe(
                switchMap(refreshSuccess => {
                  if (refreshSuccess) {
                    // After refresh (or if not needed), validate tokens
                    return this.areCurrentTokensValid();
                  } else {
                    // If refresh failed, tokens are invalid
                    return new Observable<boolean>(observer => {
                      observer.next(false);
                      observer.complete();
                    });
                  }
                })
              );
            }),
            tap(isValid => {
              if (!isValid) {
                console.warn('Tokens are no longer valid, clearing current tokens');
                this.clearCurrentTokens();
              }
            })
          );
        }
        return new Observable(observer => observer.complete());
      })
    ).subscribe();
  }

  /**
   * Save tokens to local storage
   */
  private saveTokensToStorage(tokens: TokenData): void {
    try {
      const tokenData = {
        ...tokens,
        dFechaExpiracion: tokens.dFechaExpiracion.toISOString()
      };
      localStorage.setItem('chatapp_tokens', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  /**
   * Load tokens from local storage
   */
  private loadTokensFromStorage(): void {
    try {
      const storedTokens = localStorage.getItem('chatapp_tokens');
      if (storedTokens) {
        const tokenData = JSON.parse(storedTokens);
        const tokens: TokenData = {
          ...tokenData,
          dFechaExpiracion: new Date(tokenData.dFechaExpiracion)
        };
        
        // Check if tokens are not expired
        if (new Date() < tokens.dFechaExpiracion) {
          this.currentTokens$.next(tokens);
        } else {
          this.removeTokensFromStorage();
        }
      }
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
      this.removeTokensFromStorage();
    }
  }

  /**
   * Remove tokens from local storage
   */
  private removeTokensFromStorage(): void {
    try {
      localStorage.removeItem('chatapp_tokens');
    } catch (error) {
      console.error('Error removing tokens from storage:', error);
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud inválida';
          break;
        case 401:
          errorMessage = 'No autorizado - Token inválido';
          this.clearCurrentTokens();
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.message || error.message}`;
      }
    }

    console.error('AuthTokensService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  };
}
