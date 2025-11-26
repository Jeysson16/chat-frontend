import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { ApplicationSettings } from '../entities/application.entity';
import { ApplicationRepository } from '../repositories/application.repository';

export interface GetApplicationConfigRequest {
  applicationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetApplicationConfigUseCase extends UseCaseWithParams<GetApplicationConfigRequest, ApplicationSettings> {
  constructor(private applicationRepository: ApplicationRepository) {
    super();
  }

  execute(request: GetApplicationConfigRequest): Observable<ApplicationSettings> {
    return this.applicationRepository.getConfiguration(request.applicationId);
  }
}