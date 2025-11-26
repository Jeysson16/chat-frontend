import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from './base.use-case';
import { Application } from '../entities/application.entity';
import { IApplicationRepository } from '../repositories/application.repository';

@Injectable({
  providedIn: 'root'
})
export class GetApplicationsUseCase extends UseCase<void, Application[]> {
  constructor(private applicationRepository: IApplicationRepository) {
    super();
  }

  execute(): Observable<Application[]> {
    return this.applicationRepository.getAll();
  }
}