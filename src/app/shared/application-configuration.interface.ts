/**
 * Interface para la tabla ConfiguracionAplicacion
 * Estándar: PascalCase/Húngaro
 */
export interface IConfiguracionAplicacion {
  nConfiguracionAplicacionId: number;
  nAplicacionesId: number;
  cConfiguracionAplicacionClave: string;
  cConfiguracionAplicacionValor: string;
  cConfiguracionAplicacionTipo: string;
  cConfiguracionAplicacionDescripcion?: string;
  dConfiguracionAplicacionFechaCreacion?: Date;
  dConfiguracionAplicacionFechaActualizacion?: Date;
  bConfiguracionAplicacionEsActiva?: boolean;
}

/**
 * DTO para crear una nueva configuración de aplicación
 */
export interface ICreateConfiguracionAplicacionDto {
  nAplicacionesId: number;
  cConfiguracionAplicacionClave: string;
  cConfiguracionAplicacionValor: string;
  cConfiguracionAplicacionTipo: string;
  cConfiguracionAplicacionDescripcion?: string;
  bConfiguracionAplicacionEsActiva?: boolean;
}

/**
 * DTO para actualizar una configuración de aplicación
 */
export interface IUpdateConfiguracionAplicacionDto {
  nConfiguracionAplicacionId: number;
  cConfiguracionAplicacionValor?: string;
  cConfiguracionAplicacionTipo?: string;
  cConfiguracionAplicacionDescripcion?: string;
  bConfiguracionAplicacionEsActiva?: boolean;
}

/**
 * Respuesta de la API para configuraciones de aplicación
 */
export interface IConfiguracionAplicacionResponse {
  data: IConfiguracionAplicacion[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para configuraciones agrupadas por aplicación
 */
export interface IConfiguracionAplicacionAgrupada {
  aplicacion: {
    nAplicacionesId: number;
    cAplicacionesNombre: string;
    cAplicacionesCodigo: string;
  };
  configuraciones: IConfiguracionAplicacion[];
}

/**
 * Interface para la tabla ConfiguracionEmpresa
 * Estándar: PascalCase/Húngaro
 */
export interface IConfiguracionEmpresa {
  nConfiguracionEmpresaId: number;
  nEmpresasId: number;
  nAplicacionesId: number;
  cConfiguracionEmpresaClave: string;
  cConfiguracionEmpresaValor: string;
  cConfiguracionEmpresaTipo: string;
  cConfiguracionEmpresaDescripcion?: string;
  dConfiguracionEmpresaFechaCreacion?: Date;
  dConfiguracionEmpresaFechaActualizacion?: Date;
  bConfiguracionEmpresaEsActiva?: boolean;
}

/**
 * DTO para crear una nueva configuración de empresa
 */
export interface ICreateConfiguracionEmpresaDto {
  nEmpresasId: number;
  nAplicacionesId: number;
  cConfiguracionEmpresaClave: string;
  cConfiguracionEmpresaValor: string;
  cConfiguracionEmpresaTipo: string;
  cConfiguracionEmpresaDescripcion?: string;
  bConfiguracionEmpresaEsActiva?: boolean;
}

/**
 * DTO para actualizar una configuración de empresa
 */
export interface IUpdateConfiguracionEmpresaDto {
  nConfiguracionEmpresaId: number;
  cConfiguracionEmpresaValor?: string;
  cConfiguracionEmpresaTipo?: string;
  cConfiguracionEmpresaDescripcion?: string;
  bConfiguracionEmpresaEsActiva?: boolean;
}

/**
 * Respuesta de la API para configuraciones de empresa
 */
export interface IConfiguracionEmpresaResponse {
  data: IConfiguracionEmpresa[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para configuraciones agrupadas por empresa y aplicación
 */
export interface IConfiguracionEmpresaAgrupada {
  empresa: {
    nEmpresasId: number;
    cEmpresasNombre: string;
    cEmpresasCodigo: string;
  };
  aplicacion: {
    nAplicacionesId: number;
    cAplicacionesNombre: string;
    cAplicacionesCodigo: string;
  };
  configuraciones: IConfiguracionEmpresa[];
}

/**
 * Interface para configuraciones heredadas de aplicación
 */
export interface IConfiguracionHeredada {
  clave: string;
  valorAplicacion: string;
  valorEmpresa?: string;
  tipoConfiguracion: string;
  descripcion?: string;
  esPersonalizada: boolean;
}