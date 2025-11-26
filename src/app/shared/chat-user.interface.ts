/**
 * Interface para la tabla Usuarios (chat_usuarios)
 * Estándar: PascalCase/Húngaro
 */
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

/**
 * DTO para crear un nuevo usuario de chat
 */
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

/**
 * DTO para actualizar un usuario de chat
 */
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

/**
 * Respuesta de la API para usuarios de chat
 */
export interface IUsuarioChatResponse {
  data: IUsuarioChat[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para búsqueda de usuarios
 */
export interface IBuscarUsuarioChatDto {
  cTerminoBusqueda?: string;
  nEmpresasId?: number;
  nAplicacionesId?: number;
  cUsuariosEstado?: 'online' | 'offline' | 'away' | 'busy';
  bUsuariosEsActivo?: boolean;
}

/**
 * Interface extendida para usuarios de chat con información adicional
 */
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