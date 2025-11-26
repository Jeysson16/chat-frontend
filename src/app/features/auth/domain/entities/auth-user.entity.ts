export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}