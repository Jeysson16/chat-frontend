import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from './base.use-case';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable({
  providedIn: 'root'
})
export class LogoutUseCase extends UseCase<void, void> {
  constructor(private authRepository: AuthRepository) {
    super();
  }

  execute(): Observable<void> {
    return this.authRepository.logout();
  }
}