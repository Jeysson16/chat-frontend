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

export interface ICreateEmpresaDto {
  cEmpresasNombre: string;
  cEmpresasCodigo: string;
  cEmpresasDescripcion?: string;
  cEmpresasEmail?: string;
  cEmpresasTelefono?: string;
  cEmpresasDireccion?: string;
  bEmpresasEsActiva?: boolean;
}

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

export interface IEmpresaResponse {
  data: IEmpresa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IEmpresaSelect {
  nEmpresasId: number;
  cEmpresasNombre: string;
  cEmpresasCodigo: string;
  bEmpresasEsActiva: boolean;
}