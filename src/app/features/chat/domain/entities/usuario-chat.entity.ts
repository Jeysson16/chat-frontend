export interface IUsuarioChat {
  nUsuariosId: number;
  cUsuariosNombre: string;
  cUsuariosEmail: string;
  cUsuariosCodigo: string;
  cUsuariosAvatar?: string;
  cUsuariosEstado: 'online' | 'offline' | 'away' | 'busy';
  cUsuariosRol?: string;
  nEmpresasId?: number;
  nAplicacionesId?: number;
  dUsuariosFechaCreacion?: Date;
  dUsuariosFechaUltimaActividad?: Date;
  bUsuariosEsActivo?: boolean;
}

export interface ICreateUsuarioChatDto {
  cUsuariosNombre: string;
  cUsuariosEmail: string;
  cUsuariosCodigo: string;
  cUsuariosAvatar?: string;
  cUsuariosRol?: string;
  nEmpresasId?: number;
  nAplicacionesId?: number;
  bUsuariosEsActivo?: boolean;
}

export interface IUpdateUsuarioChatDto {
  cUsuariosNombre?: string;
  cUsuariosEmail?: string;
  cUsuariosCodigo?: string;
  cUsuariosAvatar?: string;
  cUsuariosEstado?: 'online' | 'offline' | 'away' | 'busy';
  cUsuariosRol?: string;
  nEmpresasId?: number;
  nAplicacionesId?: number;
  bUsuariosEsActivo?: boolean;
}

export interface IUsuarioChatResponse {
  data: IUsuarioChat[];
  total: number;
  page: number;
  limit: number;
}

export interface IBuscarUsuarioChatDto {
  cTerminoBusqueda?: string;
  nEmpresasId?: number;
  nAplicacionesId?: number;
  cUsuariosEstado?: 'online' | 'offline' | 'away' | 'busy';
  bUsuariosEsActivo?: boolean;
}

export interface IUsuarioChatExtendido extends IUsuarioChat {
  empresa?: {
    nEmpresasId: number;
    cEmpresasNombre: string;
    cEmpresasCodigo: string;
  };
  aplicacion?: {
    nAplicacionesId: number;
    cAplicacionesNombre: string;
    cAplicacionesCodigo: string;
  };
  nTotalConversaciones?: number;
  nMensajesEnviados?: number;
}
