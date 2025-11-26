import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = import.meta.env.NG_APP_API_URL;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Realiza una petición GET
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get<T>(url, { ...this.httpOptions, params })
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Realiza una petición POST
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza una petición PUT
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.put<T>(url, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza una petición PATCH
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.patch<T>(url, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Realiza una petición DELETE
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.delete<T>(url, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Uploads a file
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const url = `${this.baseUrl}${endpoint}`;
    return this.http.post<T>(url, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Downloads a file
   */
  downloadFile(endpoint: string): Observable<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please verify the data sent.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 409:
          errorMessage = 'Conflict. The resource already exists or is in use.';
          break;
        case 422:
          errorMessage = 'Invalid input data.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }

      // If the server sends a specific error message
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Error en ApiService:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Builds query parameters for pagination
   */
  buildPaginationParams(page: number, pageSize: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): any {
    const params: any = {
      page: page.toString(),
      pageSize: pageSize.toString()
    };

    if (sortBy) {
      params.sortBy = sortBy;
    }

    if (sortOrder) {
      params.sortOrder = sortOrder;
    }

    return params;
  }

  /**
   * Builds query parameters for filters
   */
  buildFilterParams(filters: Record<string, any>): any {
    const params: any = {};

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value.toString();
      }
    });

    return params;
  }
}