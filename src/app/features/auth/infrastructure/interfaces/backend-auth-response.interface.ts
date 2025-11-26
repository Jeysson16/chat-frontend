// Interface for the actual backend response structure
export interface BackendAuthResponse {
  isSuccess: boolean;
  lstError: any[];
  item: BackendAuthItem; // Single item object, not array
  warnings?: any[];
  ticket?: string;
  clientName?: string;
  userName?: string;
  serverName?: string;
}

export interface BackendAuthItem {
  success: boolean;
  isSuccess: boolean;
  message: string;
  expiresAt: string;
  token: string;
  refreshToken?: string;
  appCode: string; // Código de la aplicación
  appName: string; // Nombre de la aplicación
  user: BackendUserInfo;
  serverName: string;
  ticket: string;
  userName: string;
  warnings: any[];
}

export interface BackendUserInfo {
  id: string;
  nombre: string;
  email: string;
  nombreUsuario: string;
  rol: string;
  estaActivo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  cPerJurCodigo: string;
  cPerCodigo: string;
  cUsuarioNombre: string;
  cUsuarioEmail: string;
}

