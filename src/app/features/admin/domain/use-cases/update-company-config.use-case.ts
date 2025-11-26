import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { CompanyConfiguration } from '../entities/company.entity';
import { ICompanyRepository } from '../repositories/company.repository';

export interface UpdateCompanyConfigRequest {
  companyId: string;
  configuration: CompanyConfiguration;
}

@Injectable({
  providedIn: 'root'
})
export class UpdateCompanyConfigUseCase extends UseCaseWithParams<UpdateCompanyConfigRequest, CompanyConfiguration> {
  constructor(private companyRepository: ICompanyRepository) {
    super();
  }

  execute(request: UpdateCompanyConfigRequest): Observable<CompanyConfiguration> {
    return this.companyRepository.updateConfiguration(request.companyId, request.configuration);
  }
}