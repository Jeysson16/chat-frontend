import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CompanyRepository } from '../../domain/repositories/company.repository';
import { Company, CompanyConfiguration } from '../../domain/entities/company.entity';

interface CompanyDto {
  id: string;
  applicationId: string;
  name: string;
  description: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyConfigurationDto {
  // Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  
  // Customization
  customCss?: string;
  customJavaScript?: string;
  
  // Notifications
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enablePushNotifications: boolean;
  
  // Chat Limits
  maxChannels: number;
  maxUsersPerChannel: number;
  maxMessageLength: number;
  
  // Storage and Performance
  storageQuotaGB: number;
  sessionTimeoutMinutes: number;
  
  // Features
  enableFileSharing: boolean;
  enableScreenSharing: boolean;
  enableVoiceMessages: boolean;
  enableVideoCall: boolean;
  enableGroupChat: boolean;
  
  // Security
  enableMessageEncryption: boolean;
  enableAuditLog: boolean;
  requireTwoFactor: boolean;
  
  // Integration
  enableWebhooks: boolean;
  webhookUrl?: string;
  enableApiAccess: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyRepositoryImpl implements CompanyRepository {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL}/v1`;
  
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

  getByApplication(applicationId: string): Observable<Company[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CompanyDto[]>(`${this.baseUrl}/applications/${applicationId}/companies`, { headers }).pipe(
      map(dtos => dtos.map(dto => this.mapDtoToEntity(dto)))
    );
  }

  getById(companyId: string): Observable<Company> {
    const headers = this.getAuthHeaders();
    return this.http.get<CompanyDto>(`${this.baseUrl}/companies/${companyId}`, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  create(company: Omit<Company, 'id'>): Observable<Company> {
    const headers = this.getAuthHeaders();
    const dto = this.mapEntityToDto(company);
    return this.http.post<CompanyDto>(`${this.baseUrl}/companies`, dto, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  update(company: Company): Observable<Company> {
    const headers = this.getAuthHeaders();
    const dto = this.mapEntityToDto(company);
    return this.http.put<CompanyDto>(`${this.baseUrl}/companies/${company.id}`, dto, { headers }).pipe(
      map(dto => this.mapDtoToEntity(dto))
    );
  }

  delete(companyId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.baseUrl}/companies/${companyId}`, { headers });
  }

  getConfiguration(companyId: string): Observable<CompanyConfiguration> {
    // Leer applicationId desde storage (persistido en chat.page)
    let applicationId = '';
    try {
      const stored = localStorage.getItem('application') || sessionStorage.getItem('application');
      if (stored) applicationId = JSON.parse(stored).id || '';
    } catch {}
    
    const headers = this.getAuthHeaders();
    const url = `${this.baseUrl}/configuracion-empresa/empresa/${companyId}/aplicacion/${applicationId}`;
    return this.http.get<CompanyConfigurationDto>(url, { headers }).pipe(
      map(dto => this.mapConfigurationDtoToEntity(dto))
    );
  }

  updateConfiguration(companyId: string, configuration: CompanyConfiguration): Observable<CompanyConfiguration> {
    const headers = this.getAuthHeaders();
    const dto = this.mapConfigurationEntityToDto(configuration);
    return this.http.put<CompanyConfigurationDto>(`${this.baseUrl}/companies/${companyId}/configuration`, dto, { headers }).pipe(
      map(dto => this.mapConfigurationDtoToEntity(dto))
    );
  }

  private mapDtoToEntity(dto: CompanyDto): Company {
    return new Company(
      dto.id,
      dto.applicationId,
      dto.name,
      dto.description,
      dto.domain,
      dto.isActive,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  private mapEntityToDto(entity: Company | Omit<Company, 'id'>): Partial<CompanyDto> {
    return {
      id: 'id' in entity ? entity.id : undefined,
      applicationId: entity.applicationId,
      name: entity.name,
      description: entity.description,
      domain: entity.domain,
      isActive: entity.isActive
    };
  }

  private mapConfigurationDtoToEntity(dto: CompanyConfigurationDto): CompanyConfiguration {
    return {
      // Branding
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      logoUrl: dto.logoUrl,
      
      // Customization
      customCss: dto.customCss,
      customJavaScript: dto.customJavaScript,
      
      // Notifications
      enableEmailNotifications: dto.enableEmailNotifications,
      enableSmsNotifications: dto.enableSmsNotifications,
      enablePushNotifications: dto.enablePushNotifications,
      
      // Chat Limits
      maxChannels: dto.maxChannels,
      maxUsersPerChannel: dto.maxUsersPerChannel,
      maxMessageLength: dto.maxMessageLength,
      
      // Storage and Performance
      storageQuotaGB: dto.storageQuotaGB,
      sessionTimeoutMinutes: dto.sessionTimeoutMinutes,
      
      // Features
      enableFileSharing: dto.enableFileSharing,
      enableScreenSharing: dto.enableScreenSharing,
      enableVoiceMessages: dto.enableVoiceMessages,
      enableVideoCall: dto.enableVideoCall,
      enableGroupChat: dto.enableGroupChat,
      
      // Security
      enableMessageEncryption: dto.enableMessageEncryption,
      enableAuditLog: dto.enableAuditLog,
      requireTwoFactor: dto.requireTwoFactor,
      
      // Integration
      enableWebhooks: dto.enableWebhooks,
      webhookUrl: dto.webhookUrl,
      enableApiAccess: dto.enableApiAccess
    };
  }

  private mapConfigurationEntityToDto(entity: CompanyConfiguration): CompanyConfigurationDto {
    return {
      // Branding
      primaryColor: entity.primaryColor,
      secondaryColor: entity.secondaryColor,
      logoUrl: entity.logoUrl,
      
      // Customization
      customCss: entity.customCss,
      customJavaScript: entity.customJavaScript,
      
      // Notifications
      enableEmailNotifications: entity.enableEmailNotifications,
      enableSmsNotifications: entity.enableSmsNotifications,
      enablePushNotifications: entity.enablePushNotifications,
      
      // Chat Limits
      maxChannels: entity.maxChannels,
      maxUsersPerChannel: entity.maxUsersPerChannel,
      maxMessageLength: entity.maxMessageLength,
      
      // Storage and Performance
      storageQuotaGB: entity.storageQuotaGB,
      sessionTimeoutMinutes: entity.sessionTimeoutMinutes,
      
      // Features
      enableFileSharing: entity.enableFileSharing,
      enableScreenSharing: entity.enableScreenSharing,
      enableVoiceMessages: entity.enableVoiceMessages,
      enableVideoCall: entity.enableVideoCall,
      enableGroupChat: entity.enableGroupChat,
      
      // Security
      enableMessageEncryption: entity.enableMessageEncryption,
      enableAuditLog: entity.enableAuditLog,
      requireTwoFactor: entity.requireTwoFactor,
      
      // Integration
      enableWebhooks: entity.enableWebhooks,
      webhookUrl: entity.webhookUrl,
      enableApiAccess: entity.enableApiAccess
    };
  }
}