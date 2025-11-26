import { InjectionToken } from '@angular/core';
import { ApplicationRepository } from '../../features/admin/domain/repositories/application.repository';
import { CompanyRepository } from '../../features/admin/domain/repositories/company.repository';
import { IConfigurationValidator, INotificationService } from '../interfaces/configuration.interface';

export const APPLICATION_REPOSITORY_TOKEN = new InjectionToken<ApplicationRepository>('ApplicationRepository');
export const COMPANY_REPOSITORY_TOKEN = new InjectionToken<CompanyRepository>('CompanyRepository');
export const CONFIGURATION_VALIDATOR_TOKEN = new InjectionToken<IConfigurationValidator>('IConfigurationValidator');
export const NOTIFICATION_SERVICE_TOKEN = new InjectionToken<INotificationService>('INotificationService');