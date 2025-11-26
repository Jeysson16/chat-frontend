import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCaseWithParams } from './base.use-case';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthResult } from '../models/application.model';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegisterUseCase extends UseCaseWithParams<RegisterRequest, AuthResult> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  execute(request: RegisterRequest): Observable<AuthResult> {
    return this.authRepository.register(request.email, request.password, request.username);
  }
}