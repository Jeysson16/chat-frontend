import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthResult } from '../models/application.model';

export interface LoginRequest {
  userCode?: string;
  email?: string;
  username?: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase extends UseCaseWithParams<LoginRequest, AuthResult> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  execute(request: LoginRequest): Observable<AuthResult> {
    const userCode = request.userCode || request.email || request.username || '';
    return this.authRepository.login(userCode, request.password);
  }
}