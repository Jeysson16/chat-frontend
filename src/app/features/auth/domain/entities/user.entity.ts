export interface UserEntity {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Campos adicionales del backend
  userCode?: string; // cUsuario del backend
  personCode?: string; // cPerJurCodigo del backend
  cPerCodigo?: string; // Código de persona para SignalR
  companyId?: number;
  applicationId?: number;
}