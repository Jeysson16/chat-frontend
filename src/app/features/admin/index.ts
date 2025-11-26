// Admin Feature Public API
// This file defines what the admin feature exports to other features

// Domain exports
export * from './domain/entities/application.entity';

// Infrastructure exports
export * from './infrastructure/services/application.service';
export * from './infrastructure/adapters/application-data.adapter';

// Presentation exports
export * from './presentation/admin.module';
export * from './presentation/admin-layout/admin-layout.component';
export * from './presentation/admin-sidebar/admin-sidebar.component';
export * from './presentation/admin-panel/admin-panel.component';
export * from './presentation/section-components';

// Shared exports
export * from './shared/interfaces';

// Configuration exports
export * from './config/environment';

// Feature metadata
export const ADMIN_FEATURE = {
  name: 'admin',
  version: '1.0.0',
  dependencies: ['@angular/core', '@angular/common', '@angular/router', '@angular/forms', 'rxjs'],
  description: 'Administration feature module for managing applications, users, and configurations'
} as const;