export interface Application {
  code: string;
  name: string;
  id?: string;
}

export interface ApplicationInfo {
  app: Application;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  userCode?: string;
  cPerCodigo?: string;
  cPerJurCodigo?: string;
  personCode?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
}

export interface LoginCredentials {
  userCode: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyId?: string;
  acceptTerms: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  application?: Application;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}