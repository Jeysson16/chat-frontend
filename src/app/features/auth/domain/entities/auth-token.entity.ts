export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface LoginRequest {
  userCode?: string;
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}