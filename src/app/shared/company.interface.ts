/**
 * Interface para la tabla Empresas
 * Estándar: PascalCase/Húngaro
 */
export interface IEmpresa {
  nEmpresasId: number;
  cEmpresasNombre: string;
  cEmpresasCodigo: string;
  cEmpresasDescripcion?: string;
  cEmpresasEmail?: string;
  cEmpresasTelefono?: string;
  cEmpresasDireccion?: string;
  dEmpresasFechaCreacion?: Date;
  dEmpresasFechaActualizacion?: Date;
  bEmpresasEsActiva?: boolean;
}

/**
 * DTO para crear una nueva empresa
 */
export interface ICreateEmpresaDto {
  cEmpresasNombre: string;
  cEmpresasCodigo: string;
  cEmpresasDescripcion?: string;
  cEmpresasEmail?: string;
  cEmpresasTelefono?: string;
  cEmpresasDireccion?: string;
  bEmpresasEsActiva?: boolean;
}

/**
 * DTO para actualizar una empresa
 */
export interface IUpdateEmpresaDto {
  nEmpresasId: number;
  cEmpresasNombre?: string;
  cEmpresasCodigo?: string;
  cEmpresasDescripcion?: string;
  cEmpresasEmail?: string;
  cEmpresasTelefono?: string;
  cEmpresasDireccion?: string;
  bEmpresasEsActiva?: boolean;
}

/**
 * Respuesta de la API para empresas
 */
export interface IEmpresaResponse {
  data: IEmpresa[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para selección de empresa en dropdowns
 */
export interface IEmpresaSelect {
  nEmpresasId: number;
  cEmpresasNombre: string;
  cEmpresasCodigo: string;
  bEmpresasEsActiva: boolean;
}