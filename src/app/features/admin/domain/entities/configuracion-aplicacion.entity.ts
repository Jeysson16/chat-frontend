export interface IConfiguracionAplicacionEntity {
  nConfiguracionAplicacionId: number;
  nAplicacionesId: number;
  nAdjuntosMaxTamanoArchivo: number;
  cAdjuntosTiposArchivosPermitidos: string;
  bAdjuntosPermitirAdjuntos: boolean;
  nAdjuntosMaxArchivosSimultaneos: number;
  bAdjuntosPermitirImagenes: boolean;
  bAdjuntosPermitirDocumentos: boolean;
  bAdjuntosPermitirVideos: boolean;
  bAdjuntosPermitirAudio: boolean;
  bAdjuntosRequiereAprobacion: boolean;
  nChatMaxLongitudMensaje: number;
  bChatPermitirEmojis: boolean;
  bChatPermitirMenciones: boolean;
  bChatPermitirReacciones: boolean;
  bChatPermitirEdicionMensajes: boolean;
  bChatPermitirEliminacionMensajes: boolean;
  nChatTiempoLimiteEdicion: number;
  bChatPermitirMensajesPrivados: boolean;
  bSeguridadRequiereAutenticacion: boolean;
  bSeguridadEncriptarMensajes: boolean;
  nSeguridadTiempoSesionMinutos: number;
  bSeguridadRequiere2FA: boolean;
  bSeguridadPermitirSesionesMultiples: boolean;
  bConfiguracionEstaActiva: boolean;
  dConfiguracionFechaCreacion: string;
  dConfiguracionFechaModificacion: string;
}

export interface IConfiguracionAplicacionEntityResponse {
  data: IConfiguracionAplicacionEntity;
  success: boolean;
  message?: string;
}

export interface ICreateConfiguracionAplicacionEntityDto {
  nAplicacionesId: number;
  nAdjuntosMaxTamanoArchivo?: number;
  cAdjuntosTiposArchivosPermitidos?: string;
  bAdjuntosPermitirAdjuntos?: boolean;
  nAdjuntosMaxArchivosSimultaneos?: number;
  bAdjuntosPermitirImagenes?: boolean;
  bAdjuntosPermitirDocumentos?: boolean;
  bAdjuntosPermitirVideos?: boolean;
  bAdjuntosPermitirAudio?: boolean;
  bAdjuntosRequiereAprobacion?: boolean;
  nChatMaxLongitudMensaje?: number;
  bChatPermitirEmojis?: boolean;
  bChatPermitirMenciones?: boolean;
  bChatPermitirReacciones?: boolean;
  bChatPermitirEdicionMensajes?: boolean;
  bChatPermitirEliminacionMensajes?: boolean;
  nChatTiempoLimiteEdicion?: number;
  bChatPermitirMensajesPrivados?: boolean;
  bSeguridadRequiereAutenticacion?: boolean;
  bSeguridadEncriptarMensajes?: boolean;
  nSeguridadTiempoSesionMinutos?: number;
  bSeguridadRequiere2FA?: boolean;
  bSeguridadPermitirSesionesMultiples?: boolean;
  bConfiguracionEstaActiva?: boolean;
}

export interface IUpdateConfiguracionAplicacionEntityDto {
  nAdjuntosMaxTamanoArchivo?: number;
  cAdjuntosTiposArchivosPermitidos?: string;
  bAdjuntosPermitirAdjuntos?: boolean;
  nAdjuntosMaxArchivosSimultaneos?: number;
  bAdjuntosPermitirImagenes?: boolean;
  bAdjuntosPermitirDocumentos?: boolean;
  bAdjuntosPermitirVideos?: boolean;
  bAdjuntosPermitirAudio?: boolean;
  bAdjuntosRequiereAprobacion?: boolean;
  nChatMaxLongitudMensaje?: number;
  bChatPermitirEmojis?: boolean;
  bChatPermitirMenciones?: boolean;
  bChatPermitirReacciones?: boolean;
  bChatPermitirEdicionMensajes?: boolean;
  bChatPermitirEliminacionMensajes?: boolean;
  nChatTiempoLimiteEdicion?: number;
  bChatPermitirMensajesPrivados?: boolean;
  bSeguridadRequiereAutenticacion?: boolean;
  bSeguridadEncriptarMensajes?: boolean;
  nSeguridadTiempoSesionMinutos?: number;
  bSeguridadRequiere2FA?: boolean;
  bSeguridadPermitirSesionesMultiples?: boolean;
  bConfiguracionEstaActiva?: boolean;
}

export const DEFAULT_CONFIGURACION_APLICACION_ENTITY: Omit<IConfiguracionAplicacionEntity, 'nConfiguracionAplicacionId' | 'nAplicacionesId' | 'dConfiguracionFechaCreacion' | 'dConfiguracionFechaModificacion'> = {
  nAdjuntosMaxTamanoArchivo: 10485760,
  cAdjuntosTiposArchivosPermitidos: 'jpg,jpeg,png,gif,pdf,doc,docx,txt,mp3,wav,mp4,avi',
  bAdjuntosPermitirAdjuntos: true,
  nAdjuntosMaxArchivosSimultaneos: 5,
  bAdjuntosPermitirImagenes: true,
  bAdjuntosPermitirDocumentos: true,
  bAdjuntosPermitirVideos: false,
  bAdjuntosPermitirAudio: false,
  bAdjuntosRequiereAprobacion: false,
  nChatMaxLongitudMensaje: 1000,
  bChatPermitirEmojis: true,
  bChatPermitirMenciones: true,
  bChatPermitirReacciones: true,
  bChatPermitirEdicionMensajes: false,
  bChatPermitirEliminacionMensajes: false,
  nChatTiempoLimiteEdicion: 0,
  bChatPermitirMensajesPrivados: false,
  bSeguridadRequiereAutenticacion: true,
  bSeguridadEncriptarMensajes: true,
  nSeguridadTiempoSesionMinutos: 3600,
  bSeguridadRequiere2FA: false,
  bSeguridadPermitirSesionesMultiples: true,
  bConfiguracionEstaActiva: true
}
