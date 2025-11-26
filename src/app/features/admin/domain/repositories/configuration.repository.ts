import { Observable } from 'rxjs';
import { Application } from '../entities/application.entity';
import { Company } from '../entities/company.entity';
import { ApplicationSettings } from '../entities/application.entity';
import { CompanyConfiguration } from '../entities/company.entity';

export interface IConfigurationRepository {
  // Application methods
  getApplicationsList(): Observable<Application[]>;
  getApplicationById(applicationId: string): Observable<Application>;
  createApplication(application: Omit<Application, 'id'>): Observable<Application>;
  updateApplication(application: Application): Observable<Application>;
  deleteApplication(applicationId: string): Observable<void>;

  // Application Configuration methods
  getApplicationConfiguration(applicationId: string): Observable<ApplicationSettings>;
  updateApplicationConfiguration(applicationId: string, config: ApplicationSettings): Observable<ApplicationSettings>;

  // Company methods
  getCompaniesByApplication(applicationId: string): Observable<Company[]>;
  getCompanyById(applicationId: string, companyId: string): Observable<Company>;
  createCompany(applicationId: string, company: Omit<Company, 'id' | 'applicationId'>): Observable<Company>;
  updateCompany(company: Company): Observable<Company>;
  deleteCompany(applicationId: string, companyId: string): Observable<void>;

  // Company Configuration methods
  getCompanyConfiguration(applicationId: string, companyId: string): Observable<CompanyConfiguration>;
  updateCompanyConfiguration(applicationId: string, companyId: string, config: CompanyConfiguration): Observable<CompanyConfiguration>;
}