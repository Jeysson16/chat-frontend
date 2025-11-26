import { Observable } from 'rxjs';
import { Application, ApplicationSettings } from '../entities/application.entity';

export abstract class ApplicationRepository {
  abstract getAll(): Observable<Application[]>;
  abstract getById(id: string): Observable<Application>;
  abstract getByCode(code: string): Observable<Application>;
  abstract create(application: Omit<Application, 'id'>): Observable<Application>;
  abstract update(application: Application): Observable<Application>;
  abstract delete(id: string): Observable<void>;
  
  // Configuration support
  abstract getConfiguration(applicationId: string): Observable<ApplicationSettings>;
  abstract updateConfiguration(applicationId: string, configuration: ApplicationSettings): Observable<ApplicationSettings>;
}