import { Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Use Cases
import { ApplicationUseCase } from '../usecases/application.usecase';
import { CompanyUseCase } from '../usecases/company.usecase';

// Repository Interfaces
import { ApplicationRepository } from '../../features/admin/domain/repositories/application.repository';
import { CompanyRepository } from '../../features/admin/domain/repositories/company.repository';

// Repository Implementations
import { ApplicationRepositoryImpl } from '../../features/admin/infrastructure/repositories/application.repository';
import { CompanyRepositoryImpl } from '../../features/admin/infrastructure/repositories/company.repository';

// Service Interfaces
import { IConfigurationValidator, INotificationService } from '../interfaces/configuration.interface';

// Service Implementations
import { ConfigurationValidatorService } from '../../features/admin/infrastructure/services/configuration-validator.service';
import { NotificationService } from '../../features/admin/infrastructure/services/notification.service';

// Injection Tokens
import { 
  APPLICATION_REPOSITORY_TOKEN, 
  COMPANY_REPOSITORY_TOKEN, 
  CONFIGURATION_VALIDATOR_TOKEN, 
  NOTIFICATION_SERVICE_TOKEN 
} from '../tokens/injection.tokens';

export const configurationProviders: Provider[] = [
  // Repository Providers
  {
    provide: APPLICATION_REPOSITORY_TOKEN,
    useClass: ApplicationRepositoryImpl,
    deps: [HttpClient]
  },
  {
    provide: COMPANY_REPOSITORY_TOKEN,
    useClass: CompanyRepositoryImpl,
    deps: [HttpClient]
  },
  
  // Service Providers
  {
    provide: CONFIGURATION_VALIDATOR_TOKEN,
    useClass: ConfigurationValidatorService
  },
  {
    provide: NOTIFICATION_SERVICE_TOKEN,
    useClass: NotificationService
  },
  
  // Use Case Providers
  {
    provide: ApplicationUseCase,
    useClass: ApplicationUseCase,
    deps: [APPLICATION_REPOSITORY_TOKEN, CONFIGURATION_VALIDATOR_TOKEN, NOTIFICATION_SERVICE_TOKEN]
  },
  {
    provide: CompanyUseCase,
    useClass: CompanyUseCase,
    deps: [COMPANY_REPOSITORY_TOKEN, CONFIGURATION_VALIDATOR_TOKEN, NOTIFICATION_SERVICE_TOKEN]
  }
];
