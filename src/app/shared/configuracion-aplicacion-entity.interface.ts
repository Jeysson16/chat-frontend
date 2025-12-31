/**
 * Interface que representa la estructura completa del backend para ConfiguracionAplicacion
 * Basada en la entidad proporcionada
 */
export interface IConfiguracionAplicacionEntity {
  nConfiguracionAplicacionId: number;
  nAplicacionesId: number;
  
  // Configuraciones de adjuntos
  nAdjuntosMaxTamanoArchivo: number;
  cAdjuntosTiposArchivosPermitidos: string;
  bAdjuntosPermitirAdjuntos: boolean;
  nAdjuntosMaxArchivosSimultaneos: number;
  bAdjuntosPermitirImagenes: boolean;
  bAdjuntosPermitirDocumentos: boolean;
  bAdjuntosPermitirVideos: boolean;
  bAdjuntosPermitirAudio: boolean;
  bAdjuntosRequiereAprobacion: boolean;
  
  // Configuraciones de chat
  nChatMaxLongitudMensaje: number;
  bChatPermitirEmojis: boolean;
  bChatPermitirMenciones: boolean;
  bChatPermitirReacciones: boolean;
  bChatPermitirEdicionMensajes: boolean;
  bChatPermitirEliminacionMensajes: boolean;
  nChatTiempoLimiteEdicion: number;
  bChatPermitirMensajesPrivados: boolean;
  
  // Configuraciones de conversaciones
  nConversacionesMaxSimultaneas: number;
  bConversacionesPermitirChatsGrupales: boolean;
  nConversacionesMaxParticipantesGrupo: number;
  bConversacionesPermitirCrearGrupos: boolean;
  bConversacionesRequiereAprobacionGrupos: boolean;
  
  // Configuraciones de contactos
  bContactosPermitirAgregar: boolean;
  bContactosRequiereAprobacion: boolean;
  bContactosPermitirBusquedaGlobal: boolean;
  bContactosPermitirInvitaciones: boolean;
  nContactosMaxContactos: number;
  cContactosModoGestion: string;
  cContactosUrlApiPersonas: string;
  cContactosTokenApiPersonas: string;
  bContactosSincronizar: boolean;
  nContactosTiempoCacheSegundos: number;
  bContactosHabilitarCache: boolean;
  nContactosIntervaloSincronizacionMinutos: number;
  
  // Configuraciones de notificaciones
  bNotificacionesEmail: boolean;
  bNotificacionesPush: boolean;
  bNotificacionesEnTiempoReal: boolean;
  bNotificacionesSonido: boolean;
  bNotificacionesVibracion: boolean;
  cNotificacionesHorarioInicio: string;
  cNotificacionesHorarioFin: string;
  bNotificacionesNoMolestar: boolean;
  
  // Configuraciones de seguridad
  bSeguridadRequiereAutenticacion: boolean;
  bSeguridadEncriptarMensajes: boolean;
  nSeguridadTiempoSesionMinutos: number;
  bSeguridadRequiere2FA: boolean;
  bSeguridadPermitirSesionesMultiples: boolean;
  bSeguridadLogearActividad: boolean;
  nSeguridadMaxIntentosLogin: number;
  nSeguridadTiempoBloqueoMinutos: number;
  
  // Configuraciones de interfaz
  cInterfazTema: string;
  cInterfazIdioma: string;
  bInterfazModoOscuro: boolean;
  cInterfazColorPrimario: string;
  cInterfazColorSecundario: string;
  cInterfazFuenteTamano: string;
  bInterfazAnimaciones: boolean;
  bInterfazSonidos: boolean;
  
  // Configuraciones de almacenamiento
  cAlmacenamientoTipo: string;
  cAlmacenamientoRuta: string;
  nAlmacenamientoMaxEspacioMB: number;
  bAlmacenamientoCompresion: boolean;
  nAlmacenamientoDiasRetencion: number;
  bAlmacenamientoLimpiezaAutomatica: boolean;
  
  // Configuraciones de rendimiento
  nRendimientoMaxConexionesSimultaneas: number;
  nRendimientoTimeoutConexionSegundos: number;
  bRendimientoHabilitarCache: boolean;
  nRendimientoTiempoCacheSegundos: number;
  bRendimientoCompresionMensajes: boolean;
  nRendimientoMaxMensajesPorMinuto: number;
  
  // Configuraciones de integración
  bIntegracionHabilitarWebhooks: boolean;
  cIntegracionUrlWebhook: string;
  cIntegracionTokenWebhook: string;
  bIntegracionHabilitarAPI: boolean;
  cIntegracionVersionAPI: string;
  bIntegracionRequiereTokenAPI: boolean;
  
  // Configuraciones de moderación
  bModeracionHabilitarFiltros: boolean;
  cModeracionPalabrasProhibidas: string;
  bModeracionAutoModerar: boolean;
  bModeracionRequiereAprobacion: boolean;
  nModeracionMaxReportesPorUsuario: number;
  bModeracionLogearAcciones: boolean;
  
  // Configuraciones de backup
  bBackupHabilitarAutomatico: boolean;
  nBackupIntervaloHoras: number;
  cBackupRutaDestino: string;
  bBackupCompresion: boolean;
  nBackupDiasRetencion: number;
  bBackupIncluirAdjuntos: boolean;
  
  // Configuraciones de auditoría
  bAuditoriaHabilitar: boolean;
  bAuditoriaLogearMensajes: boolean;
  bAuditoriaLogearConexiones: boolean;
  bAuditoriaLogearCambiosConfiguracion: boolean;
  nAuditoriaDiasRetencionLogs: number;
  cAuditoriaRutaLogs: string;
  
  // Metadatos
  dConfiguracionFechaCreacion: string;
  dConfiguracionFechaModificacion: string;
  cConfiguracionCreadoPor: string;
  cConfiguracionModificadoPor: string;
  bConfiguracionEstaActiva: boolean;
}

/**
 * Interface para la respuesta de la API con la configuración completa
 */
export interface IConfiguracionAplicacionEntityResponse {
  data: IConfiguracionAplicacionEntity;
  success: boolean;
  message?: string;
}

/**
 * Interface para crear una nueva configuración de aplicación
 */
export interface ICreateConfiguracionAplicacionEntityDto {
  nAplicacionesId: number;
  
  // Configuraciones de adjuntos
  nAdjuntosMaxTamanoArchivo?: number;
  cAdjuntosTiposArchivosPermitidos?: string;
  bAdjuntosPermitirAdjuntos?: boolean;
  nAdjuntosMaxArchivosSimultaneos?: number;
  bAdjuntosPermitirImagenes?: boolean;
  bAdjuntosPermitirDocumentos?: boolean;
  bAdjuntosPermitirVideos?: boolean;
  bAdjuntosPermitirAudio?: boolean;
  bAdjuntosRequiereAprobacion?: boolean;
  
  // Configuraciones de chat
  nChatMaxLongitudMensaje?: number;
  bChatPermitirEmojis?: boolean;
  bChatPermitirMenciones?: boolean;
  bChatPermitirReacciones?: boolean;
  bChatPermitirEdicionMensajes?: boolean;
  bChatPermitirEliminacionMensajes?: boolean;
  nChatTiempoLimiteEdicion?: number;
  bChatPermitirMensajesPrivados?: boolean;
  
  // Configuraciones de conversaciones
  nConversacionesMaxSimultaneas?: number;
  bConversacionesPermitirChatsGrupales?: boolean;
  nConversacionesMaxParticipantesGrupo?: number;
  bConversacionesPermitirCrearGrupos?: boolean;
  bConversacionesRequiereAprobacionGrupos?: boolean;
  
  // Configuraciones de contactos
  bContactosPermitirAgregar?: boolean;
  bContactosRequiereAprobacion?: boolean;
  bContactosPermitirBusquedaGlobal?: boolean;
  bContactosPermitirInvitaciones?: boolean;
  nContactosMaxContactos?: number;
  cContactosModoGestion?: string;
  cContactosUrlApiPersonas?: string;
  cContactosTokenApiPersonas?: string;
  bContactosSincronizar?: boolean;
  nContactosTiempoCacheSegundos?: number;
  bContactosHabilitarCache?: boolean;
  nContactosIntervaloSincronizacionMinutos?: number;
  
  // Configuraciones de notificaciones
  bNotificacionesEmail?: boolean;
  bNotificacionesPush?: boolean;
  bNotificacionesEnTiempoReal?: boolean;
  bNotificacionesSonido?: boolean;
  bNotificacionesVibracion?: boolean;
  cNotificacionesHorarioInicio?: string;
  cNotificacionesHorarioFin?: string;
  bNotificacionesNoMolestar?: boolean;
  
  // Configuraciones de seguridad
  bSeguridadRequiereAutenticacion?: boolean;
  bSeguridadEncriptarMensajes?: boolean;
  nSeguridadTiempoSesionMinutos?: number;
  bSeguridadRequiere2FA?: boolean;
  bSeguridadPermitirSesionesMultiples?: boolean;
  bSeguridadLogearActividad?: boolean;
  nSeguridadMaxIntentosLogin?: number;
  nSeguridadTiempoBloqueoMinutos?: number;
  
  // Configuraciones de interfaz
  cInterfazTema?: string;
  cInterfazIdioma?: string;
  bInterfazModoOscuro?: boolean;
  cInterfazColorPrimario?: string;
  cInterfazColorSecundario?: string;
  cInterfazFuenteTamano?: string;
  bInterfazAnimaciones?: boolean;
  bInterfazSonidos?: boolean;
  
  // Configuraciones de almacenamiento
  cAlmacenamientoTipo?: string;
  cAlmacenamientoRuta?: string;
  nAlmacenamientoMaxEspacioMB?: number;
  bAlmacenamientoCompresion?: boolean;
  nAlmacenamientoDiasRetencion?: number;
  bAlmacenamientoLimpiezaAutomatica?: boolean;
  
  // Configuraciones de rendimiento
  nRendimientoMaxConexionesSimultaneas?: number;
  nRendimientoTimeoutConexionSegundos?: number;
  bRendimientoHabilitarCache?: boolean;
  nRendimientoTiempoCacheSegundos?: number;
  bRendimientoCompresionMensajes?: boolean;
  nRendimientoMaxMensajesPorMinuto?: number;
  
  // Configuraciones de integración
  bIntegracionHabilitarWebhooks?: boolean;
  cIntegracionUrlWebhook?: string;
  cIntegracionTokenWebhook?: string;
  bIntegracionHabilitarAPI?: boolean;
  cIntegracionVersionAPI?: string;
  bIntegracionRequiereTokenAPI?: boolean;
  
  // Configuraciones de moderación
  bModeracionHabilitarFiltros?: boolean;
  cModeracionPalabrasProhibidas?: string;
  bModeracionAutoModerar?: boolean;
  bModeracionRequiereAprobacion?: boolean;
  nModeracionMaxReportesPorUsuario?: number;
  bModeracionLogearAcciones?: boolean;
  
  // Configuraciones de backup
  bBackupHabilitarAutomatico?: boolean;
  nBackupIntervaloHoras?: number;
  cBackupRutaDestino?: string;
  bBackupCompresion?: boolean;
  nBackupDiasRetencion?: number;
  bBackupIncluirAdjuntos?: boolean;
  
  // Configuraciones de auditoría
  bAuditoriaHabilitar?: boolean;
  bAuditoriaLogearMensajes?: boolean;
  bAuditoriaLogearConexiones?: boolean;
  bAuditoriaLogearCambiosConfiguracion?: boolean;
  nAuditoriaDiasRetencionLogs?: number;
  cAuditoriaRutaLogs?: string;
  
  // Estado
  bConfiguracionEstaActiva?: boolean;
}

/**
 * Interface para actualizar una configuración de aplicación
 */
export interface IUpdateConfiguracionAplicacionEntityDto {
  // Configuraciones de adjuntos
  nAdjuntosMaxTamanoArchivo?: number;
  cAdjuntosTiposArchivosPermitidos?: string;
  bAdjuntosPermitirAdjuntos?: boolean;
  nAdjuntosMaxArchivosSimultaneos?: number;
  bAdjuntosPermitirImagenes?: boolean;
  bAdjuntosPermitirDocumentos?: boolean;
  bAdjuntosPermitirVideos?: boolean;
  bAdjuntosPermitirAudio?: boolean;
  bAdjuntosRequiereAprobacion?: boolean;
  
  // Configuraciones de chat
  nChatMaxLongitudMensaje?: number;
  bChatPermitirEmojis?: boolean;
  bChatPermitirMenciones?: boolean;
  bChatPermitirReacciones?: boolean;
  bChatPermitirEdicionMensajes?: boolean;
  bChatPermitirEliminacionMensajes?: boolean;
  nChatTiempoLimiteEdicion?: number;
  bChatPermitirMensajesPrivados?: boolean;
  
  // Configuraciones de conversaciones
  nConversacionesMaxSimultaneas?: number;
  bConversacionesPermitirChatsGrupales?: boolean;
  nConversacionesMaxParticipantesGrupo?: number;
  bConversacionesPermitirCrearGrupos?: boolean;
  bConversacionesRequiereAprobacionGrupos?: boolean;
  
  // Configuraciones de contactos
  bContactosPermitirAgregar?: boolean;
  bContactosRequiereAprobacion?: boolean;
  bContactosPermitirBusquedaGlobal?: boolean;
  bContactosPermitirInvitaciones?: boolean;
  nContactosMaxContactos?: number;
  cContactosModoGestion?: string;
  cContactosUrlApiPersonas?: string;
  cContactosTokenApiPersonas?: string;
  bContactosSincronizar?: boolean;
  nContactosTiempoCacheSegundos?: number;
  bContactosHabilitarCache?: boolean;
  nContactosIntervaloSincronizacionMinutos?: number;
  
  // Configuraciones de notificaciones
  bNotificacionesEmail?: boolean;
  bNotificacionesPush?: boolean;
  bNotificacionesEnTiempoReal?: boolean;
  bNotificacionesSonido?: boolean;
  bNotificacionesVibracion?: boolean;
  cNotificacionesHorarioInicio?: string;
  cNotificacionesHorarioFin?: string;
  bNotificacionesNoMolestar?: boolean;
  
  // Configuraciones de seguridad
  bSeguridadRequiereAutenticacion?: boolean;
  bSeguridadEncriptarMensajes?: boolean;
  nSeguridadTiempoSesionMinutos?: number;
  bSeguridadRequiere2FA?: boolean;
  bSeguridadPermitirSesionesMultiples?: boolean;
  bSeguridadLogearActividad?: boolean;
  nSeguridadMaxIntentosLogin?: number;
  nSeguridadTiempoBloqueoMinutos?: number;
  
  // Configuraciones de interfaz
  cInterfazTema?: string;
  cInterfazIdioma?: string;
  bInterfazModoOscuro?: boolean;
  cInterfazColorPrimario?: string;
  cInterfazColorSecundario?: string;
  cInterfazFuenteTamano?: string;
  bInterfazAnimaciones?: boolean;
  bInterfazSonidos?: boolean;
  
  // Configuraciones de almacenamiento
  cAlmacenamientoTipo?: string;
  cAlmacenamientoRuta?: string;
  nAlmacenamientoMaxEspacioMB?: number;
  bAlmacenamientoCompresion?: boolean;
  nAlmacenamientoDiasRetencion?: number;
  bAlmacenamientoLimpiezaAutomatica?: boolean;
  
  // Configuraciones de rendimiento
  nRendimientoMaxConexionesSimultaneas?: number;
  nRendimientoTimeoutConexionSegundos?: number;
  bRendimientoHabilitarCache?: boolean;
  nRendimientoTiempoCacheSegundos?: number;
  bRendimientoCompresionMensajes?: boolean;
  nRendimientoMaxMensajesPorMinuto?: number;
  
  // Configuraciones de integración
  bIntegracionHabilitarWebhooks?: boolean;
  cIntegracionUrlWebhook?: string;
  cIntegracionTokenWebhook?: string;
  bIntegracionHabilitarAPI?: boolean;
  cIntegracionVersionAPI?: string;
  bIntegracionRequiereTokenAPI?: boolean;
  
  // Configuraciones de moderación
  bModeracionHabilitarFiltros?: boolean;
  cModeracionPalabrasProhibidas?: string;
  bModeracionAutoModerar?: boolean;
  bModeracionRequiereAprobacion?: boolean;
  nModeracionMaxReportesPorUsuario?: number;
  bModeracionLogearAcciones?: boolean;
  
  // Configuraciones de backup
  bBackupHabilitarAutomatico?: boolean;
  nBackupIntervaloHoras?: number;
  cBackupRutaDestino?: string;
  bBackupCompresion?: boolean;
  nBackupDiasRetencion?: number;
  bBackupIncluirAdjuntos?: boolean;
  
  // Configuraciones de auditoría
  bAuditoriaHabilitar?: boolean;
  bAuditoriaLogearMensajes?: boolean;
  bAuditoriaLogearConexiones?: boolean;
  bAuditoriaLogearCambiosConfiguracion?: boolean;
  nAuditoriaDiasRetencionLogs?: number;
  cAuditoriaRutaLogs?: string;
  
  // Estado
  bConfiguracionEstaActiva?: boolean;
}

/**
 * Valores por defecto para una nueva configuración de aplicación
 */
export const DEFAULT_CONFIGURACION_APLICACION_ENTITY: Omit<IConfiguracionAplicacionEntity, 'nConfiguracionAplicacionId' | 'nAplicacionesId' | 'dConfiguracionFechaCreacion' | 'dConfiguracionFechaModificacion' | 'cConfiguracionCreadoPor' | 'cConfiguracionModificadoPor'> = {
  // Configuraciones de adjuntos
  nAdjuntosMaxTamanoArchivo: 10485760, // 10MB
  cAdjuntosTiposArchivosPermitidos: 'jpg,jpeg,png,gif,pdf,doc,docx,txt,mp3,wav,mp4,avi',
  bAdjuntosPermitirAdjuntos: true,
  nAdjuntosMaxArchivosSimultaneos: 5,
  bAdjuntosPermitirImagenes: true,
  bAdjuntosPermitirDocumentos: true,
  bAdjuntosPermitirVideos: false,
  bAdjuntosPermitirAudio: false,
  bAdjuntosRequiereAprobacion: false,
  
  // Configuraciones de chat
  nChatMaxLongitudMensaje: 1000,
  bChatPermitirEmojis: true,
  bChatPermitirMenciones: true,
  bChatPermitirReacciones: true,
  bChatPermitirEdicionMensajes: false,
  bChatPermitirEliminacionMensajes: false,
  nChatTiempoLimiteEdicion: 0,
  bChatPermitirMensajesPrivados: false,
  
  // Configuraciones de conversaciones
  nConversacionesMaxSimultaneas: 10,
  bConversacionesPermitirChatsGrupales: true,
  nConversacionesMaxParticipantesGrupo: 50,
  bConversacionesPermitirCrearGrupos: false,
  bConversacionesRequiereAprobacionGrupos: false,
  
  // Configuraciones de contactos
  bContactosPermitirAgregar: true,
  bContactosRequiereAprobacion: false,
  bContactosPermitirBusquedaGlobal: false,
  bContactosPermitirInvitaciones: true,
  nContactosMaxContactos: 500,
  cContactosModoGestion: '',
  cContactosUrlApiPersonas: '',
  cContactosTokenApiPersonas: '',
  bContactosSincronizar: false,
  nContactosTiempoCacheSegundos: 0,
  bContactosHabilitarCache: false,
  nContactosIntervaloSincronizacionMinutos: 0,
  
  // Configuraciones de notificaciones
  bNotificacionesEmail: true,
  bNotificacionesPush: true,
  bNotificacionesEnTiempoReal: false,
  bNotificacionesSonido: true,
  bNotificacionesVibracion: false,
  cNotificacionesHorarioInicio: '',
  cNotificacionesHorarioFin: '',
  bNotificacionesNoMolestar: false,
  
  // Configuraciones de seguridad
  bSeguridadRequiereAutenticacion: true,
  bSeguridadEncriptarMensajes: true,
  nSeguridadTiempoSesionMinutos: 3600,
  bSeguridadRequiere2FA: false,
  bSeguridadPermitirSesionesMultiples: true,
  bSeguridadLogearActividad: true,
  nSeguridadMaxIntentosLogin: 0,
  nSeguridadTiempoBloqueoMinutos: 0,
  
  // Configuraciones de interfaz
  cInterfazTema: 'default',
  cInterfazIdioma: 'es',
  bInterfazModoOscuro: true,
  cInterfazColorPrimario: '',
  cInterfazColorSecundario: '',
  cInterfazFuenteTamano: '',
  bInterfazAnimaciones: false,
  bInterfazSonidos: false,
  
  // Configuraciones de almacenamiento
  cAlmacenamientoTipo: '',
  cAlmacenamientoRuta: '',
  nAlmacenamientoMaxEspacioMB: 0,
  bAlmacenamientoCompresion: false,
  nAlmacenamientoDiasRetencion: 0,
  bAlmacenamientoLimpiezaAutomatica: false,
  
  // Configuraciones de rendimiento
  nRendimientoMaxConexionesSimultaneas: 0,
  nRendimientoTimeoutConexionSegundos: 0,
  bRendimientoHabilitarCache: false,
  nRendimientoTiempoCacheSegundos: 0,
  bRendimientoCompresionMensajes: false,
  nRendimientoMaxMensajesPorMinuto: 0,
  
  // Configuraciones de integración
  bIntegracionHabilitarWebhooks: false,
  cIntegracionUrlWebhook: '',
  cIntegracionTokenWebhook: '',
  bIntegracionHabilitarAPI: false,
  cIntegracionVersionAPI: '',
  bIntegracionRequiereTokenAPI: false,
  
  // Configuraciones de moderación
  bModeracionHabilitarFiltros: false,
  cModeracionPalabrasProhibidas: '',
  bModeracionAutoModerar: false,
  bModeracionRequiereAprobacion: false,
  nModeracionMaxReportesPorUsuario: 0,
  bModeracionLogearAcciones: false,
  
  // Configuraciones de backup
  bBackupHabilitarAutomatico: false,
  nBackupIntervaloHoras: 0,
  cBackupRutaDestino: '',
  bBackupCompresion: false,
  nBackupDiasRetencion: 0,
  bBackupIncluirAdjuntos: false,
  
  // Configuraciones de auditoría
  bAuditoriaHabilitar: false,
  bAuditoriaLogearMensajes: false,
  bAuditoriaLogearConexiones: false,
  bAuditoriaLogearCambiosConfiguracion: false,
  nAuditoriaDiasRetencionLogs: 0,
  cAuditoriaRutaLogs: '',
  
  // Estado
  bConfiguracionEstaActiva: true
};