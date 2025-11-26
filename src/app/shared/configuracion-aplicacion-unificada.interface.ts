/**
 * Interface para la nueva estructura unificada de ConfiguracionAplicacion
 * Coincide con la estructura del backend implementada
 */
export interface IConfiguracionAplicacionUnificada {
  id?: string;
  cAppCodigo: string;
  
  // Configuraciones de adjuntos
  nMaxTamanoArchivo: number;
  cTiposArchivosPermitidos: string;
  bPermitirAdjuntos: boolean;
  nMaxCantidadAdjuntos: number;
  bPermitirVisualizacionAdjuntos: boolean;
  
  // Configuraciones de chat
  nMaxLongitudMensaje: number;
  bPermitirEmojis: boolean;
  bPermitirMensajesVoz: boolean;
  bPermitirNotificaciones: boolean;
  
  // Configuraciones de seguridad
  bRequiereAutenticacion: boolean;
  bPermitirMensajesAnonimos: boolean;
  nTiempoExpiracionSesion: number;
  
  // Configuraciones de gestión de contactos
  cModoGestionContactos: string; // 'API_EXTERNA' | 'LOCAL' | 'HIBRIDO'
  cUrlApiPersonas?: string;
  cTokenApiPersonas?: string;
  bSincronizarContactos: boolean;
  nTiempoCacheContactos: number;
  bHabilitarCacheContactos: boolean;
  nIntervaloSincronizacionMinutos: number;
  
  // Metadatos
  createdAt?: Date;
  updatedAt?: Date;
  bEsActiva: boolean;
}

/**
 * DTO para crear una nueva configuración unificada
 */
export interface ICreateConfiguracionAplicacionUnificadaDto {
  cAppCodigo: string;
  
  // Configuraciones de adjuntos (con valores por defecto)
  nMaxTamanoArchivo?: number; // Default: 10485760 (10MB)
  cTiposArchivosPermitidos?: string; // Default: 'jpg,jpeg,png,gif,pdf,doc,docx,txt'
  bPermitirAdjuntos?: boolean; // Default: true
  nMaxCantidadAdjuntos?: number; // Default: 5
  bPermitirVisualizacionAdjuntos?: boolean; // Default: true
  
  // Configuraciones de chat (con valores por defecto)
  nMaxLongitudMensaje?: number; // Default: 1000
  bPermitirEmojis?: boolean; // Default: true
  bPermitirMensajesVoz?: boolean; // Default: true
  bPermitirNotificaciones?: boolean; // Default: true
  
  // Configuraciones de seguridad (con valores por defecto)
  bRequiereAutenticacion?: boolean; // Default: true
  bPermitirMensajesAnonimos?: boolean; // Default: false
  nTiempoExpiracionSesion?: number; // Default: 3600
  
  // Configuraciones de gestión de contactos (con valores por defecto)
  cModoGestionContactos?: string; // Default: 'LOCAL'
  cUrlApiPersonas?: string;
  cTokenApiPersonas?: string;
  bSincronizarContactos?: boolean; // Default: false
  nTiempoCacheContactos?: number; // Default: 3600
  bHabilitarCacheContactos?: boolean; // Default: true
  nIntervaloSincronizacionMinutos?: number; // Default: 60
  
  bEsActiva?: boolean; // Default: true
}

/**
 * DTO para actualizar una configuración unificada
 */
export interface IUpdateConfiguracionAplicacionUnificadaDto {
  // Configuraciones de adjuntos
  nMaxTamanoArchivo?: number;
  cTiposArchivosPermitidos?: string;
  bPermitirAdjuntos?: boolean;
  nMaxCantidadAdjuntos?: number;
  bPermitirVisualizacionAdjuntos?: boolean;
  
  // Configuraciones de chat
  nMaxLongitudMensaje?: number;
  bPermitirEmojis?: boolean;
  bPermitirMensajesVoz?: boolean;
  bPermitirNotificaciones?: boolean;
  
  // Configuraciones de seguridad
  bRequiereAutenticacion?: boolean;
  bPermitirMensajesAnonimos?: boolean;
  nTiempoExpiracionSesion?: number;
  
  // Configuraciones de gestión de contactos
  cModoGestionContactos?: string;
  cUrlApiPersonas?: string;
  cTokenApiPersonas?: string;
  bSincronizarContactos?: boolean;
  nTiempoCacheContactos?: number;
  bHabilitarCacheContactos?: boolean;
  nIntervaloSincronizacionMinutos?: number;
  
  bEsActiva?: boolean;
}

/**
 * Respuesta de la API para configuraciones unificadas
 */
export interface IConfiguracionAplicacionUnificadaResponse {
  data: IConfiguracionAplicacionUnificada;
  success: boolean;
  message?: string;
}

/**
 * Respuesta de la API para lista de configuraciones
 */
export interface IConfiguracionAplicacionUnificadaListResponse {
  data: IConfiguracionAplicacionUnificada[];
  total: number;
  success: boolean;
  message?: string;
}

/**
 * Interface para configuración específica de adjuntos
 */
export interface IConfiguracionAdjuntos {
  nMaxTamanoArchivo: number;
  cTiposArchivosPermitidos: string;
  bPermitirAdjuntos: boolean;
  nMaxCantidadAdjuntos: number;
  bPermitirVisualizacionAdjuntos: boolean;
}

/**
 * Interface para configuración específica de chat
 */
export interface IConfiguracionChat {
  nMaxLongitudMensaje: number;
  bPermitirEmojis: boolean;
  bPermitirMensajesVoz: boolean;
  bPermitirNotificaciones: boolean;
}

/**
 * Interface para configuración específica de seguridad
 */
export interface IConfiguracionSeguridad {
  bRequiereAutenticacion: boolean;
  bPermitirMensajesAnonimos: boolean;
  nTiempoExpiracionSesion: number;
}

/**
 * Interface para configuración específica de gestión de contactos
 */
export interface IConfiguracionContactos {
  cModoGestionContactos: string; // 'API_EXTERNA' | 'LOCAL' | 'HIBRIDO'
  cUrlApiPersonas?: string;
  cTokenApiPersonas?: string;
  bSincronizarContactos: boolean;
  nTiempoCacheContactos: number;
  bHabilitarCacheContactos: boolean;
  nIntervaloSincronizacionMinutos: number;
}

/**
 * Enum para los modos de gestión de contactos
 */
export enum ModoGestionContactos {
  API_EXTERNA = 'API_EXTERNA',
  LOCAL = 'LOCAL',
  HIBRIDO = 'HIBRIDO'
}

/**
 * Valores por defecto para nueva configuración
 */
export const DEFAULT_CONFIGURACION_APLICACION: Omit<IConfiguracionAplicacionUnificada, 'id' | 'cAppCodigo' | 'createdAt' | 'updatedAt'> = {
  // Configuraciones de adjuntos
  nMaxTamanoArchivo: 10485760, // 10MB
  cTiposArchivosPermitidos: 'jpg,jpeg,png,gif,pdf,doc,docx,txt',
  bPermitirAdjuntos: true,
  nMaxCantidadAdjuntos: 5,
  bPermitirVisualizacionAdjuntos: true,
  
  // Configuraciones de chat
  nMaxLongitudMensaje: 1000,
  bPermitirEmojis: true,
  bPermitirMensajesVoz: true,
  bPermitirNotificaciones: true,
  
  // Configuraciones de seguridad
  bRequiereAutenticacion: true,
  bPermitirMensajesAnonimos: false,
  nTiempoExpiracionSesion: 3600, // 1 hora
  
  // Configuraciones de gestión de contactos
  cModoGestionContactos: ModoGestionContactos.LOCAL,
  bSincronizarContactos: false,
  nTiempoCacheContactos: 3600, // 1 hora
  bHabilitarCacheContactos: true,
  nIntervaloSincronizacionMinutos: 60, // 1 hora
  
  bEsActiva: true
};