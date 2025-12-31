export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  companyId?: string;
  companyName?: string;
  userCode?: string; // Código único del usuario (cPerCodigo)
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
}

export interface LoginCredentials {
  userCode: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyId?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
