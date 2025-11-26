// Entity interfaces that match backend database field names (nomenclatura: tipo + tabla + campo)
// These represent the exact structure returned by the backend API

export interface ChatConversacionEntity {
  nConversacionesChatId: number;
  cConversacionesChatAppCodigo: string;
  cConversacionesChatNombre: string;
  cConversacionesChatTipo: string;
  cConversacionesChatUsuarioCreadorId: string;
  dConversacionesChatFechaCreacion: string;
  dConversacionesChatUltimaActividad: string;
  bConversacionesChatEstaActiva: boolean;
}

export interface ChatMensajeEntity {
  nMensajesChatId: number;
  nMensajesChatConversacionId: number;
  cMensajesChatRemitenteId: string;
  cMensajesChatTexto: string;
  cMensajesChatTipo: string;
  dMensajesChatFechaHora: string;
  bMensajesChatEstaLeido: boolean;
  cMensajesChatRemitenteNombre?: string;
}

export interface ChatUsuarioEntity {
  nUsuariosChatId: number;
  cUsuariosChatId: string;
  cUsuariosChatNombre: string;
  cUsuariosChatEmail: string;
  cUsuariosChatAvatar?: string;
  cUsuariosChatRol: string;
  bUsuariosChatEstaActivo: boolean;
  dUsuariosChatUltimaConexion?: string;
  bUsuariosChatEstaEnLinea: boolean;
  cPerJurCodigo?: string;
  cPerCodigo?: string;
  dUsuariosChatFechaCreacion?: string;
}

export interface ChatParticipanteEntity {
  nParticipantesChatId: number;
  nParticipantesChatConversacionId: number;
  cParticipantesChatUsuarioId: string;
  dParticipantesChatFechaUnion: string;
  bParticipantesChatEstaActivo: boolean;
  cParticipantesChatRol: string;
}

// Response wrapper for backend API responses
export interface BackendChatResponse<T> {
  isSuccess: boolean;
  lstItem: T[];
  item?: T;
  message?: string;
  error?: string;
}