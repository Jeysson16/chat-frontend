import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

// Domain
import { AuthRepository } from '../../features/auth/domain/repositories/auth.repository';

// Infrastructure
import { AuthRepositoryImpl } from '../../features/auth/infrastructure/repositories/auth.repository.impl';

// Interceptors
import { HybridAuthInterceptor } from '../interceptors/hybrid-auth.interceptor';

// Services
import { AuthTokensService } from '../../features/auth/infrastructure/services/auth-tokens.service';

// Use Cases
import { LoginUseCase } from '../../features/auth/domain/use-cases/login.use-case';
import { LogoutUseCase } from '../../features/auth/domain/use-cases/logout.use-case';
import { RegisterUseCase } from '../../features/auth/domain/use-cases/register.use-case';

export const authProviders: Provider[] = [
  // Repository Provider
  {
    provide: AuthRepository,
    useClass: AuthRepositoryImpl
  },
  
  // Services
  AuthTokensService,
  
  // HTTP Interceptors
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HybridAuthInterceptor,
    multi: true
  },
  
  // Use Case Providers
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase
];