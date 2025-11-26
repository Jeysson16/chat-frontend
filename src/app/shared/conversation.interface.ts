import { IUsuarioChat } from './usuario-chat.interface';

/**
 * Interface para la tabla Conversaciones
 * Estándar: PascalCase/Húngaro
 */
export interface IConversacion {
  nConversacionesId: number;
  cConversacionesNombre: string;
  cConversacionesTipo: 'individual' | 'grupo';
  nAplicacionesId: number;
  nEmpresasId?: number;
  dConversacionesFechaCreacion?: Date;
  dConversacionesFechaActualizacion?: Date;
  bConversacionesEsActiva?: boolean;
}

/**
 * DTO para crear una nueva conversación
 */
export interface ICreateConversacionDto {
  cConversacionesNombre: string;
  cConversacionesTipo: 'individual' | 'grupo';
  nAplicacionesId: number;
  nEmpresasId?: number;
  participantesIds: number[];
  bConversacionesEsActiva?: boolean;
}

/**
 * DTO para actualizar una conversación
 */
export interface IUpdateConversacionDto {
  nConversacionesId: number;
  cConversacionesNombre?: string;
  bConversacionesEsActiva?: boolean;
}

/**
 * Respuesta de la API para conversaciones
 */
export interface IConversacionResponse {
  data: IConversacion[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface para conversación con información extendida
 */
export interface IConversacionExtendida extends IConversacion {
  participantes: IUsuarioChat[];
  ultimoMensaje?: {
    nMensajesId: number;
    cMensajesContenido: string;
    dMensajesFechaEnvio: Date;
    remitente: {
      nUsuariosId: number;
      cUsuariosNombre: string;
    };
  };
  mensajesNoLeidos: number;
  aplicacion?: {
    nAplicacionesId: number;
    cAplicacionesNombre: string;
    cAplicacionesCodigo: string;
  };
  empresa?: {
    nEmpresasId: number;
    cEmpresasNombre: string;
    cEmpresasCodigo: string;
  };
}

/**
 * Interface para vista previa de conversación
 */
export interface IConversacionPreview {
  nConversacionesId: number;
  cConversacionesNombre: string;
  cConversacionesTipo: 'individual' | 'grupo';
  ultimoMensaje?: string;
  dUltimoMensaje?: Date;
  mensajesNoLeidos: number;
  participantes: IUsuarioChat[];
  bEsFijada?: boolean;
}