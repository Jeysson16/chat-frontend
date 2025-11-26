import { Observable } from 'rxjs';
import { Application, ApplicationSettings } from '../../features/admin/domain/entities/application.entity';
import { Company, CompanyConfiguration } from '../../features/admin/domain/entities/company.entity';

export interface IConfigurationService {
  // Application operations
  getApplications(): Observable<Application[]>;
  getApplication(applicationId: string): Observable<Application>;
  createApplication(application: CreateApplicationRequest): Observable<Application>;
  updateApplication(application: UpdateApplicationRequest): Observable<Application>;
  deleteApplication(applicationId: string): Observable<void>;

  // Application configuration operations
  getApplicationConfiguration(applicationId: string): Observable<ApplicationSettings>;
  updateApplicationConfiguration(applicationId: string, config: ApplicationSettings): Observable<ApplicationSettings>;

  // Company operations
  getCompanies(applicationId: string): Observable<Company[]>;
  getCompany(applicationId: string, companyId: string): Observable<Company>;
  createCompany(applicationId: string, company: CreateCompanyRequest): Observable<Company>;
  updateCompany(company: UpdateCompanyRequest): Observable<Company>;
  deleteCompany(applicationId: string, companyId: string): Observable<void>;

  // Company configuration operations
  getCompanyConfiguration(applicationId: string, companyId: string): Observable<CompanyConfiguration>;
  updateCompanyConfiguration(applicationId: string, companyId: string, config: CompanyConfiguration): Observable<CompanyConfiguration>;
}

export interface CreateApplicationRequest {
  name: string;
  description: string;
  communicationType: string;
  isActive?: boolean;
}

export interface UpdateApplicationRequest {
  id: string;
  name: string;
  description: string;
  communicationType: string;
  isActive: boolean;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  domain: string;
  primaryColor?: string;
  isActive?: boolean;
}

export interface UpdateCompanyRequest {
  name: string;
  description: string;
  domain: string;
  primaryColor?: string;
  isActive: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IConfigurationValidator {
  validateApplicationConfig(config: ApplicationSettings): ValidationResult;
  validateCompanyConfig(config: CompanyConfiguration): ValidationResult;
  validateApplication(application: CreateApplicationRequest | UpdateApplicationRequest): ValidationResult;
  validateCompany(company: CreateCompanyRequest | UpdateCompanyRequest): ValidationResult;
}

export interface NotificationMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface INotificationService {
  showSuccess(title: string, message: string, duration?: number): void;
  showError(title: string, message: string, duration?: number): void;
  showWarning(title: string, message: string, duration?: number): void;
  showInfo(title: string, message: string, duration?: number): void;
}