export interface IAplicacion {
  nAplicacionesId: number;
  cAplicacionesNombre: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo: string;
  dAplicacionesFechaCreacion?: Date;
  bAplicacionesEsActiva?: boolean;
}

export interface ICreateAplicacionDto {
  cAplicacionesNombre: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo: string;
  bAplicacionesEsActiva?: boolean;
}

export interface IUpdateAplicacionDto {
  nAplicacionesId: number;
  cAplicacionesNombre?: string;
  cAplicacionesDescripcion?: string;
  cAplicacionesCodigo?: string;
  bAplicacionesEsActiva?: boolean;
}

export interface IAplicacionResponse {
  data: IAplicacion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAplicacionSelect {
  nAplicacionesId: number;
  cAplicacionesNombre: string;
  bAplicacionesEsActiva: boolean;
}