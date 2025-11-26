import { Observable } from 'rxjs';
import { Company, CompanyConfiguration } from '../entities/company.entity';

export abstract class CompanyRepository {
  abstract getByApplication(applicationId: string): Observable<Company[]>;
  abstract getById(id: string): Observable<Company>;
  abstract create(company: Omit<Company, 'id'>): Observable<Company>;
  abstract update(company: Company): Observable<Company>;
  abstract delete(id: string): Observable<void>;
  
  // Configuration support
  abstract getConfiguration(companyId: string): Observable<CompanyConfiguration>;
  abstract updateConfiguration(companyId: string, configuration: CompanyConfiguration): Observable<CompanyConfiguration>;
}