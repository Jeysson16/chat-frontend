export interface Company {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: CompanyAddress;
  contact?: CompanyContact;
  isActive: boolean;
  subscriptionPlan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiresAt?: Date;
  settings?: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
  maxUsers?: number;
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CompanyContact {
  email: string;
  phone?: string;
  contactPerson?: string;
}

export interface CompanySettings {
  allowGuestUsers: boolean;
  requireEmailVerification: boolean;
  enableFileSharing: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  chatRetentionDays: number;
  workingHours?: {
    start: string;
    end: string;
    timezone: string;
    workingDays: number[];
  };
}

export interface CompanyCreate {
  name: string;
  code: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: CompanyAddress;
  contact: CompanyContact;
  aplicacionId?: number;
}

export interface CompanyUpdate {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  address?: CompanyAddress;
  contact?: CompanyContact;
  isActive?: boolean;
  settings?: CompanySettings;
  code?: string;
}

export interface CompanyStats {
  totalUsers: number;
  activeUsers: number;
  totalConversations: number;
  totalMessages: number;
  storageUsed: number;
  storageLimit: number;
}
