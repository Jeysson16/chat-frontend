export interface Application {
  id: string;
  name: string;
  code: string;
  description?: string;
  version: string;
  isActive: boolean;
  icon?: string;
  url?: string;
  apiEndpoint?: string;
  configuration?: ApplicationConfiguration;
  permissions?: ApplicationPermission[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface ApplicationConfiguration {
  maxUsers?: number;
  features: string[];
  integrations: {
    [key: string]: any;
  };
  security: {
    requireSSL: boolean;
    allowedDomains: string[];
    sessionTimeout: number; // in minutes
  };
  notifications: {
    email: boolean;
    push: boolean;
    webhook?: string;
  };
}

export interface ApplicationPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute';
  isRequired: boolean;
}

export interface ApplicationCreate {
  name: string;
  code: string;
  description?: string;
  version: string;
  url?: string;
  apiEndpoint?: string;
  configuration?: ApplicationConfiguration;
}

export interface ApplicationUpdate {
  id: string;
  name?: string;
  description?: string;
  version?: string;
  isActive?: boolean;
  url?: string;
  apiEndpoint?: string;
  configuration?: ApplicationConfiguration;
}

export interface ApplicationStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number; // in minutes
  errorRate: number; // percentage
  uptime: number; // percentage
}