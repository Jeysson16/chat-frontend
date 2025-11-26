import { Application, User, AuthResult } from '../../domain/models/application.model';
import { BackendAuthResponse } from '../interfaces/backend-auth-response.interface';

export class AuthenticationAdapter {
  static toApplication(backendResponse: BackendAuthResponse): Application {
    const item = backendResponse.item;
    return {
      code: item?.appCode || '',
      name: item?.appName || '',
      id: item?.appCode || '' // Usar el código como ID si no hay ID explícito
    };
  }

  static toUser(backendResponse: BackendAuthResponse): User {
    const item = backendResponse.item;
    const userData = item?.user;
    if (!userData) {
      throw new Error('User data not found in response');
    }
    
    return {
      id: userData.id?.toString() || '',
      email: userData.email || '',
      name: userData.nombre || '',
      username: userData.nombreUsuario || '',
      avatar: undefined,
      role: this.mapRole(userData.rol || 'user'),
      companyId: userData.cPerJurCodigo || undefined,
      companyName: undefined,
      userCode: userData.cPerCodigo || undefined, // Map cPerCodigo from backend
      isActive: userData.estaActivo !== undefined ? userData.estaActivo : true,
      isEmailVerified: true,
      lastLoginAt: undefined,
      createdAt: userData.fechaCreacion ? new Date(userData.fechaCreacion) : new Date(),
      updatedAt: userData.fechaActualizacion ? new Date(userData.fechaActualizacion) : new Date(),
      preferences: undefined
    };
  }
  
  static toAuthResult(backendResponse: BackendAuthResponse): AuthResult {
    try {
      console.log('Backend response in toAuthResult:', backendResponse);
      const item = backendResponse.item;
      console.log('Item:', item);
      
      const user = this.toUser(backendResponse);
      console.log('Mapped user:', user);
      
      const application = this.toApplication(backendResponse);
      console.log('Mapped application:', application);
      
      return {
        success: true,
        user: user,
        application: application,
        token: item?.token || '',
        refreshToken: item?.refreshToken,
        expiresIn: item?.expiresAt ? this.parseExpiresIn(item.expiresAt) : undefined,
        message: item?.message || 'Authentication successful'
      };
    } catch (error) {
      console.error('Error in toAuthResult:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }
  
  private static mapRole(backendRole: string): 'admin' | 'user' | 'guest' {
    console.log('Mapping backend role:', backendRole);
    
    if (!backendRole) {
      console.log('No backend role provided, defaulting to user');
      return 'user';
    }
    
    const roleMap: Record<string, 'admin' | 'user' | 'guest'> = {
      'ADMIN': 'admin',
      'admin': 'admin',
      'SUPER_ADMIN': 'admin',
      'super_admin': 'admin',
      'USER': 'user',
      'user': 'user',
      'GUEST': 'guest',
      'guest': 'guest'
    };
    
    const mappedRole = roleMap[backendRole] || 'user';
    console.log(`Mapped role '${backendRole}' to '${mappedRole}'`);
    return mappedRole;
  }
  
  private static parseExpiresIn(expiresAt: string): number {
    try {
      if (!isNaN(parseInt(expiresAt))) {
        return parseInt(expiresAt);
      }
      
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const secondsUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
      return Math.max(0, secondsUntilExpiration);
    } catch (error) {
      console.warn('Error parsing expiresAt, using default 3600 seconds:', error);
      return 3600;
    }
  }
}