import { Injectable } from '@angular/core';
import { IConfigurationValidator, ValidationResult } from '../../core/interfaces/configuration.interface';
import { ApplicationSettings } from '../../domain/entities/application.entity';
import { CompanyConfiguration } from '../../domain/entities/company.entity';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationValidatorService implements IConfigurationValidator {

  validateApplication(application: any): ValidationResult {
    const errors: string[] = [];

    if (!application.name || application.name.trim().length < 3) {
      errors.push('Application name must have at least 3 characters');
    }

    if (!application.description || application.description.trim().length < 10) {
      errors.push('Description must have at least 10 characters');
    }

    if (!application.communicationType || application.communicationType.trim().length === 0) {
      errors.push('Communication type is required');
    }

    if (application.name && application.name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    if (application.description && application.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateApplicationConfig(config: ApplicationSettings): ValidationResult {
    const errors: string[] = [];

    if (config.maxFileSize && config.maxFileSize <= 0) {
      errors.push('Maximum file size must be greater than 0');
    }

    if (config.passwordMinLength && config.passwordMinLength < 4) {
      errors.push('Minimum password length must be at least 4 characters');
    }

    if (config.sessionTimeoutMinutes && config.sessionTimeoutMinutes <= 0) {
      errors.push('Session timeout must be greater than 0');
    }

    if (config.maxRequestsPerMinute && config.maxRequestsPerMinute <= 0) {
      errors.push('Maximum requests per minute must be greater than 0');
    }

    if (config.maxConcurrentConnections && config.maxConcurrentConnections <= 0) {
      errors.push('Maximum concurrent connections must be greater than 0');
    }

    if (!config.primaryColor || config.primaryColor.trim().length === 0) {
      errors.push('Primary color is required');
    }

    if (!config.secondaryColor || config.secondaryColor.trim().length === 0) {
      errors.push('Secondary color is required');
    }

    if (!config.customFont || config.customFont.trim().length === 0) {
      errors.push('Custom font is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCompany(company: any): ValidationResult {
    const errors: string[] = [];

    if (!company.name || company.name.trim().length < 2) {
      errors.push('Company name must have at least 2 characters');
    }

    if (!company.domain || company.domain.trim().length === 0) {
      errors.push('Company domain is required');
    }

    if (company.domain && !this.isValidDomain(company.domain)) {
      errors.push('Domain format is not valid');
    }

    if (company.name && company.name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateCompanyConfig(config: CompanyConfiguration): ValidationResult {
    const errors: string[] = [];

    if (!config.primaryColor || config.primaryColor.trim().length === 0) {
      errors.push('Primary color is required');
    }

    if (!config.secondaryColor || config.secondaryColor.trim().length === 0) {
      errors.push('Secondary color is required');
    }

    if (config.maxChannels && config.maxChannels <= 0) {
      errors.push('Maximum number of channels must be greater than 0');
    }

    if (config.maxUsersPerChannel && config.maxUsersPerChannel <= 0) {
      errors.push('The maximum number of users per channel must be greater than 0');
    }

    if (config.maxMessageLength && config.maxMessageLength <= 0) {
      errors.push('Maximum message length must be greater than 0');
    }

    if (config.storageQuotaGB && config.storageQuotaGB <= 0) {
      errors.push('Storage quota must be greater than 0');
    }

    if (config.sessionTimeoutMinutes && config.sessionTimeoutMinutes <= 0) {
      errors.push('Session timeout must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }
}