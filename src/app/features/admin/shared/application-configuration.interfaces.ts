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

export interface ICreateConfiguracionAplicacionDto {
  nAplicacionesId: number;
  cConfiguracionAplicacionClave: string;
  cConfiguracionAplicacionValor: string;
  cConfiguracionAplicacionTipo: string;
  cConfiguracionAplicacionDescripcion?: string;
  bConfiguracionAplicacionEsActiva?: boolean;
}

export interface IUpdateConfiguracionAplicacionDto {
  nConfiguracionAplicacionId: number;
  cConfiguracionAplicacionValor?: string;
  cConfiguracionAplicacionTipo?: string;
  cConfiguracionAplicacionDescripcion?: string;
  bConfiguracionAplicacionEsActiva?: boolean;
}

export interface IConfiguracionAplicacionResponse {
  data: IConfiguracionAplicacion[];
  total: number;
  page: number;
  limit: number;
}

export interface IConfiguracionAplicacionAgrupada {
  aplicacion: {
    nAplicacionesId: number;
    cAplicacionesNombre: string;
    cAplicacionesCodigo: string;
  };
  configuraciones: IConfiguracionAplicacion[];
}

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

export interface ICreateConfiguracionEmpresaDto {
  nEmpresasId: number;
  nAplicacionesId: number;
  cConfiguracionEmpresaClave: string;
  cConfiguracionEmpresaValor: string;
  cConfiguracionEmpresaTipo: string;
  cConfiguracionEmpresaDescripcion?: string;
  bConfiguracionEmpresaEsActiva?: boolean;
}

export interface IUpdateConfiguracionEmpresaDto {
  nConfiguracionEmpresaId: number;
  cConfiguracionEmpresaValor?: string;
  cConfiguracionEmpresaTipo?: string;
  cConfiguracionEmpresaDescripcion?: string;
  bConfiguracionEmpresaEsActiva?: boolean;
}

export interface IConfiguracionEmpresaResponse {
  data: IConfiguracionEmpresa[];
  total: number;
  page: number;
  limit: number;
}

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

export interface IConfiguracionHeredada {
  clave: string;
  valorAplicacion: string;
  valorEmpresa?: string;
  tipoConfiguracion: string;
  descripcion?: string;
  esPersonalizada: boolean;
}
