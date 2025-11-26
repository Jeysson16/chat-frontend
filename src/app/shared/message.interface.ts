/**
 * Interface para la tabla Mensajes
 * Estándar: PascalCase/Húngaro
 */
export interface IMensaje {
  nMensajesId: number;
  nConversacionesId: number;
  nUsuariosId: number;
  cMensajesContenido: string;
  cMensajesTipo: 'texto' | 'imagen' | 'archivo' | 'audio' | 'video';
  cMensajesEstado: 'enviado' | 'entregado' | 'leido';
  dMensajesFechaEnvio?: Date;
  dMensajesFechaEntrega?: Date;
  dMensajesFechaLectura?: Date;
  cMensajesMetadata?: string; // JSON con metadata adicional
  bMensajesEsActivo?: boolean;
}

/**
 * DTO para crear un nuevo mensaje
 */
export interface ICreateMensajeDto {
  nConversacionesId: number;
  cMensajesContenido: string;
  cMensajesTipo: 'texto' | 'imagen' | 'archivo' | 'audio' | 'video';
  cMensajesMetadata?: string;
}

/**
 * DTO para actualizar un mensaje
 */
export interface IUpdateMensajeDto {
  nMensajesId: number;
  cMensajesContenido?: string;
  cMensajesEstado?: 'enviado' | 'entregado' | 'leido';
  dMensajesFechaEntrega?: Date;
  dMensajesFechaLectura?: Date;
  bMensajesEsActivo?: boolean;
}

/**
 * Respuesta de la API para mensajes
 */
export interface IMensajeResponse {
  data: IMensaje[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para mensaje con información extendida
 */
export interface IMensajeExtendido extends IMensaje {
  remitente: {
    nUsuariosId: number;
    cUsuariosNombre: string;
    cUsuariosAvatar?: string;
    cUsuariosEstado: 'online' | 'offline' | 'away' | 'busy';
  };
  conversacion: {
    nConversacionesId: number;
    cConversacionesNombre: string;
    cConversacionesTipo: 'individual' | 'grupo';
  };
}

/**
 * Interface para metadata de archivos adjuntos
 */
export interface IMensajeArchivoMetadata {
  nombreArchivo: string;
  tipoArchivo: string;
  tamanoArchivo: number;
  urlArchivo: string;
  urlThumbnail?: string;
}

/**
 * Interface para búsqueda de mensajes
 */
export interface IBuscarMensajeDto {
  nConversacionesId?: number;
  cTerminoBusqueda?: string;
  cMensajesTipo?: 'texto' | 'imagen' | 'archivo' | 'audio' | 'video';
  dFechaDesde?: Date;
  dFechaHasta?: Date;
  nUsuariosId?: number;
}