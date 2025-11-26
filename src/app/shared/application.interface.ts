/**
 * Interface para la tabla Aplicaciones
 * Estándar: PascalCase/Húngaro
 */
export interface IAplicacion {
  nAplicacionesId: number;
  cAplicacionesNombre: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo: string;
  dAplicacionesFechaCreacion?: Date;
  bAplicacionesEsActiva?: boolean;
}

/**
 * DTO para crear una nueva aplicación
 */
export interface ICreateAplicacionDto {
  cAplicacionesNombre: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo: string;
  bAplicacionesEsActiva?: boolean;
}

/**
 * DTO para actualizar una aplicación
 */
export interface IUpdateAplicacionDto {
  nAplicacionesId: number;
  cAplicacionesNombre?: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo?: string;
  bAplicacionesEsActiva?: boolean;
}

/**
 * Respuesta de la API para aplicaciones
 */
export interface IAplicacionResponse {
  data: IAplicacion[];
  total: number;
  page: number;
  limit: number;
}