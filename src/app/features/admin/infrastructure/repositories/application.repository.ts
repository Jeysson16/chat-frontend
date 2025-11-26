import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApplicationRepository } from '../../domain/repositories/application.repository';
import { Application, ApplicationSettings } from '../../domain/entities/application.entity';

interface ApplicationDto {
  id: string;
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationConfigurationDto {
  // File Upload Settings
  maxFileSize: number;
  allowedFileTypes: string[];
  maxFilesPerMessage: number;
  enableFileCompression: boolean;
  
  // Security Settings
  enableEncryption: boolean;
  enableAuditLog: boolean;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  
  // Rate Limiting
  messagesPerMinute: number;
  maxConnections: number;
  connectionTimeoutSeconds: number;
  
  // Authentication
  authenticationLevel: 'basic' | 'oauth' | 'jwt' | 'api-key';
  tokenExpirationHours: number;
  enableTwoFactor: boolean;
  
  // Features
  enableChat: boolean;
  enableFileSharing: boolean;
  enableVideoCall: boolean;
  enableScreenSharing: boolean;
  enableVoiceMessages: boolean;
  enableNotifications: boolean;
  enableGroupChat: boolean;
  
  // UI Customization
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customCss?: string;
  customJavaScript?: string;
  theme: 'light' | 'dark' | 'auto';
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationRepositoryImpl implements ApplicationRepository {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL}/v1/aplicaciones`;
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // Add JWT token if available
    let token = localStorage.getItem('auth_token');
    if (!token) token = sessionStorage.getItem('auth_token') || '';
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Add application info from localStorage
    try {
      const storedApp = localStorage.getItem('application') || sessionStorage.getItem('application');
      if (storedApp) {
        const app = JSON.parse(storedApp);
        if (app?.code) headers = headers.set('x-app-code', app.code);
        if (app?.id) {
          headers = headers.set('x-app-id', app.id);
          headers = headers.set('X-Aplicacion-Id', app.id.toString());
        }
      }
    } catch (error) {
      console.warn('Error parsing application from localStorage:', error);
    }

    // Add user info from localStorage
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.id) headers = headers.set('x-user-id', user.id.toString());
        if (user?.companyId) headers = headers.set('x-per-jur-codigo', user.companyId.toString());
        if (user?.userCode) headers = headers.set('x-user-code', user.userCode.toString());
        if (user?.cPerJurCodigo) headers = headers.set('x-per-jur-codigo', user.cPerJurCodigo.toString());
        if (user?.cPerCodigo) headers = headers.set('x-per-codigo', user.cPerCodigo.toString());
        if (user?.personCode) headers = headers.set('x-person-code', user.personCode.toString());
        // Backend BaseController espera estos encabezados en mayúsculas
        if (user?.cPerJurCodigo) headers = headers.set('X-Empresa-Id', user.cPerJurCodigo.toString());
      }
    } catch (error) {
      console.warn('Error parsing user from localStorage:', error);
    }

    return headers;
  }

  getAll(): Observable<Application[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApplicationDto[]>(this.baseUrl, { headers }).pipe(
      map(dtos => dtos.map(dto => this.mapDtoToEntity(dto)))
    );
  }

  getById(id: string): Observable<Application> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApplicationDto>(`${this.baseUrl}/${id}`, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  create(application: Omit<Application, 'id'>): Observable<Application> {
    const headers = this.getAuthHeaders();
    const dto = this.mapEntityToDto(application);
    return this.http.post<ApplicationDto>(this.baseUrl, dto, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  update(application: Application): Observable<Application> {
    const headers = this.getAuthHeaders();
    const dto = this.mapEntityToDto(application);
    return this.http.put<ApplicationDto>(`${this.baseUrl}/${application.id}`, dto, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

  getConfiguration(applicationId: string): Observable<ApplicationSettings> {
    // Add proper headers and query parameters for the configuration endpoint
    const headers = this.getAuthHeaders();
    let params = new HttpParams();
    
    // Add user and application data from localStorage for SP execution
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const app = JSON.parse(localStorage.getItem('application') || '{}');
    
    if (user?.id) params = params.set('userId', user.id.toString());
    if (user?.cPerJurCodigo) params = params.set('cPerJurCodigo', user.cPerJurCodigo.toString());
    if (user?.cPerCodigo) params = params.set('cPerCodigo', user.cPerCodigo.toString());
    if (app?.id) params = params.set('aplicacionId', app.id.toString());
    
    // Verificar si applicationId es un código (string) o un ID numérico
    const isNumeric = /^\d+$/.test(applicationId);
    
    // Construir la URL correcta según el tipo de applicationId
    let url: string;
    if (isNumeric) {
      // Si es numérico, usar el endpoint por ID
      url = `${this.baseUrl}/${applicationId}/configuration`;
    } else {
      // Si es un código, usar el endpoint por código (configuracion-aplicacion)
      url = `${import.meta.env.NG_APP_API_URL}/v1/configuracion-aplicacion/por-codigo/${applicationId}`;
    }
    
    return this.http.get<ApplicationConfigurationDto>(url, { 
      headers, 
      params 
    }).pipe(
      map(dto => this.mapConfigurationDtoToEntity(dto))
    );
  }

  // Resolve application id by code
  getByCode(code: string): Observable<Application> {
    const headers = this.getAuthHeaders();
    const url = `${import.meta.env.NG_APP_API_URL}/v1/aplicaciones/codigo/${code}`;
    return this.http.get<ApplicationDto>(url, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  updateConfiguration(applicationId: string, configuration: ApplicationSettings): Observable<ApplicationSettings> {
    const headers = this.getAuthHeaders();
    const dto = this.mapConfigurationEntityToDto(configuration);
    return this.http.put<ApplicationConfigurationDto>(`${this.baseUrl}/${applicationId}/configuration`, dto, { headers }).pipe(
      map(dto => this.mapConfigurationDtoToEntity(dto))
    );
  }

  private mapDtoToEntity(dto: ApplicationDto): Application {
    return new Application(
      dto.id,
      dto.name,
      dto.description,
      dto.code,
      dto.isActive,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  private mapEntityToDto(entity: Application | Omit<Application, 'id'>): Partial<ApplicationDto> {
    return {
      id: 'id' in entity ? entity.id : undefined,
      name: entity.name,
      description: entity.description,
      code: entity.code,
      isActive: entity.isActive
    };
  }

  private mapConfigurationDtoToEntity(dto: ApplicationConfigurationDto): ApplicationSettings {
    return {
      // File Upload Settings
      maxFileSize: dto.maxFileSize,
      allowedFileTypes: dto.allowedFileTypes,
      
      // Security Settings
      enableTwoFactor: dto.enableTwoFactor,
      passwordMinLength: 8, // Default value since not in DTO
      sessionTimeoutMinutes: dto.sessionTimeoutMinutes,
      
      // Rate Limiting
      maxRequestsPerMinute: dto.messagesPerMinute,
      maxConcurrentConnections: dto.maxConnections,
      
      // Authentication
      enableSocialLogin: false, // Default value since not in DTO
      enableGuestAccess: true, // Default value since not in DTO
      
      // Features
      enableNotifications: dto.enableNotifications,
      enableAnalytics: false, // Default value since not in DTO
      enableFileSharing: dto.enableFileSharing,
      
      // UI Customization
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      logoUrl: dto.logoUrl,
      customFont: 'Roboto, Arial, sans-serif' // Default value since not in DTO
    };
  }

  private mapConfigurationEntityToDto(entity: ApplicationSettings): ApplicationConfigurationDto {
    return {
      // File Upload Settings
      maxFileSize: entity.maxFileSize,
      allowedFileTypes: entity.allowedFileTypes,
      maxFilesPerMessage: 10, // Default value since not in entity
      enableFileCompression: false, // Default value since not in entity
      
      // Security Settings
      enableEncryption: false, // Default value since not in entity
      enableAuditLog: false, // Default value since not in entity
      sessionTimeoutMinutes: entity.sessionTimeoutMinutes,
      maxLoginAttempts: 5, // Default value since not in entity
      
      // Rate Limiting
      messagesPerMinute: entity.maxRequestsPerMinute,
      maxConnections: entity.maxConcurrentConnections,
      connectionTimeoutSeconds: 30, // Default value since not in entity
      
      // Authentication
      authenticationLevel: 'basic' as const, // Default value since not in entity
      tokenExpirationHours: 24, // Default value since not in entity
      enableTwoFactor: entity.enableTwoFactor,
      
      // Features
      enableChat: true, // Default value since not in entity
      enableFileSharing: entity.enableFileSharing,
      enableVideoCall: false, // Default value since not in entity
      enableScreenSharing: false, // Default value since not in entity
      enableVoiceMessages: false, // Default value since not in entity
      enableNotifications: entity.enableNotifications,
      enableGroupChat: false, // Default value since not in entity
      
      // UI Customization
      primaryColor: entity.primaryColor,
      secondaryColor: entity.secondaryColor,
      logoUrl: entity.logoUrl,
      customCss: '', // Default value since not in entity
      customJavaScript: '', // Default value since not in entity
      theme: 'light' as const // Default value since not in entity
    };
  }
}