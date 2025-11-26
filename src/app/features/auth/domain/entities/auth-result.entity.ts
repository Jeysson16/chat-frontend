import { UserEntity } from './user.entity';

export interface AuthResult {
  success: boolean;
  user: UserEntity;
  token: string;
  refreshToken: string;
  expiresIn: number;
  message?: string;
  appCode?: string;
  appName?: string;
}