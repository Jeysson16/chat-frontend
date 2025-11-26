import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { ApplicationSettings } from '../entities/application.entity';
import { IApplicationRepository } from '../repositories/application.repository';

export interface UpdateApplicationConfigRequest {
  applicationId: string;
  configuration: ApplicationSettings;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateApplicationConfigUseCase extends UseCaseWithParams<UpdateApplicationConfigRequest, ApplicationSettings> {
  constructor(private applicationRepository: IApplicationRepository) {
    super();
  }

  execute(request: UpdateApplicationConfigRequest): Observable<ApplicationSettings> {
    return this.applicationRepository.updateConfiguration(request.applicationId, request.configuration);
  }
}