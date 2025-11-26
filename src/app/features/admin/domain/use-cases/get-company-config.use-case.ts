import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { CompanyConfiguration } from '../entities/company.entity';
import { CompanyRepository } from '../repositories/company.repository';

export interface GetCompanyConfigRequest {
  companyId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetCompanyConfigUseCase extends UseCaseWithParams<GetCompanyConfigRequest, CompanyConfiguration> {
  constructor(private companyRepository: CompanyRepository) {
    super();
  }

  execute(request: GetCompanyConfigRequest): Observable<CompanyConfiguration> {
    return this.companyRepository.getConfiguration(request.companyId);
  }
}