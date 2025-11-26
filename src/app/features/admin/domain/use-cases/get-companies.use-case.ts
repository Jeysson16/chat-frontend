import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { Company } from '../entities/company.entity';
import { ICompanyRepository } from '../repositories/company.repository';

export interface GetCompaniesRequest {
  applicationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class GetCompaniesUseCase extends UseCaseWithParams<GetCompaniesRequest, Company[]> {
  constructor(private companyRepository: ICompanyRepository) {
    super();
  }

  execute(request: GetCompaniesRequest): Observable<Company[]> {
    return this.companyRepository.getByApplication(request.applicationId);
  }
}