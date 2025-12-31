import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User } from '../../../auth/domain/models/user.model';
import { ChatAdapter } from '../adapters/chat.adapter';
import { BackendChatResponse, ChatConversacionEntity, ChatMensajeEntity, ChatUsuarioEntity } from '../entities/chat.entity';

// Backend DTOs that match the entity field names
export interface EnviarMensajeDto {
  nConversacionesChatId: number;
  cMensajesChatTexto: string;
  cMensajesChatTipo?: string;
}

export interface CrearConversacionDto {
  Nombre?: string;
  cConversacionesChatNombre: string;
  cConversacionesChatTipo: string;
  participante_ids: string[];
}

// Legacy DTOs for backward compatibility
export interface ChatUsuarioDto {
  id: string;
  nombre: string;
  email: string;
  ultima_conexion?: string;
  en_linea: boolean;
  avatar?: string;
  rol?: string;
  activo?: boolean;
}

export interface ChatMensajeDto {
  id: number;
  conversacion_id: number;
  usuario_id: string;
  usuario_nombre: string;
  texto: string;
  tipo: string;
  fecha_envio: string;
  leido: boolean;
}

export interface ChatConversacionDto {
  id: number;
  nombre: string;
  tipo: string;
  participantes: ChatUsuarioDto[];
  ultimo_mensaje?: ChatMensajeDto;
  mensajes_no_leidos: number;
  fecha_creacion: string;
}

// Backend response interfaces
export interface BackendResponse<T> {
  isSuccess: boolean;
  data?: T;
  lstError?: string[];
  lstItem?: T;
  pagination?: any;
  resultado?: any;
  ticket?: string;
  clientName?: string;
  userName?: string;
  serverName?: string;
  warnings?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatApiService {
  private readonly apiBase = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5406/api'}`;
  private getChatBase(): string {
    return `${this.apiBase}/chat`;
  }
  private readonly MOCK_USERS: ChatUsuarioEntity[] = [
    { nUsuariosChatId: 1, cUsuariosChatId: 'u1', cUsuariosChatNombre: 'Ana García', cUsuariosChatEmail: 'ana.garcia@example.com', cUsuariosChatRol: 'user', bUsuariosChatEstaActivo: true, bUsuariosChatEstaEnLinea: true },
    { nUsuariosChatId: 2, cUsuariosChatId: 'u2', cUsuariosChatNombre: 'Luis Fernández', cUsuariosChatEmail: 'luis.fernandez@example.com', cUsuariosChatRol: 'user', bUsuariosChatEstaActivo: true, bUsuariosChatEstaEnLinea: false },
    { nUsuariosChatId: 3, cUsuariosChatId: 'u3', cUsuariosChatNombre: 'María López', cUsuariosChatEmail: 'maria.lopez@example.com', cUsuariosChatRol: 'user', bUsuariosChatEstaActivo: true, bUsuariosChatEstaEnLinea: true },
    { nUsuariosChatId: 4, cUsuariosChatId: 'u4', cUsuariosChatNombre: 'Jorge Pérez', cUsuariosChatEmail: 'jorge.perez@example.com', cUsuariosChatRol: 'user', bUsuariosChatEstaActivo: true, bUsuariosChatEstaEnLinea: false }
  ];

  constructor(private http: HttpClient) {
    // Set up default headers interceptor
    this.setupHeadersInterceptor();
  }

  private setupHeadersInterceptor(): void {
    // This will be handled by an HTTP interceptor, but we can add headers manually for now
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Add JWT token if available
    let token = localStorage.getItem('auth_token');
    if (!token) token = sessionStorage.getItem('auth_token') || '';
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add application info from localStorage
    try {
      const storedApp = localStorage.getItem('application') || sessionStorage.getItem('application');
      if (storedApp) {
        const app = JSON.parse(storedApp);
        if (app?.code) headers['x-app-code'] = app.code;
        if (app?.id) {
          headers['x-app-id'] = app.id;
          headers['X-Aplicacion-Id'] = app.id.toString();
        }
      }
    } catch (error) {
      console.warn('Error parsing application from localStorage:', error);
    }

    // Add user info from localStorage
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user?.id) headers['x-user-id'] = user.id.toString();
        if (user?.companyId) headers['x-per-jur-codigo'] = user.companyId.toString();
        if (user?.userCode) headers['x-user-code'] = user.userCode.toString();
        if (user?.cPerJurCodigo) headers['x-per-jur-codigo'] = user.cPerJurCodigo.toString();
        if (user?.cPerCodigo) headers['x-per-codigo'] = user.cPerCodigo.toString();
        if (user?.personCode) headers['x-person-code'] = user.personCode.toString();
        // Backend BaseController espera estos encabezados en mayúsculas
        if (user?.cPerJurCodigo) headers['X-Empresa-Id'] = user.cPerJurCodigo.toString();
      }
    } catch (error) {
      console.warn('Error parsing user from localStorage:', error);
    }

    return headers;
  }

  // User endpoints
  getCurrentUser(): Observable<ChatUsuarioEntity> {
    const headers = this.getAuthHeaders();
    // Si existe endpoint específico de usuario actual en moderno, ajustar aquí; por ahora usamos legacy/modern equivalente si está disponible
    return this.http.get<ChatUsuarioEntity>(`${this.getChatBase()}/users/current`, { headers });
  }

  // Conversation endpoints
  getConversations(): Observable<ChatConversacionEntity[]> {
    const headers = this.getAuthHeaders();
    console.log('getConversations - Headers being sent:', headers);
    
    // Add required query parameters that follow backend nomenclatura
    let params = new HttpParams();
    
    // Get user data from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        
        // Use adapter to convert User model to backend entity parameters
        const userParams = ChatAdapter.userToBackendEntityParams(user);
        
        // Add all user parameters to the query - avoid duplicates
        const addedParams = new Set<string>();
        Object.entries(userParams).forEach(([key, value]) => {
          if (value && !addedParams.has(key)) {
            params = params.set(key, value);
            addedParams.add(key);
          }
        });
      }
      
      // Get application data from localStorage
      const storedApp = localStorage.getItem('application');
      if (storedApp) {
        const app = JSON.parse(storedApp);
        if (app?.code && !params.has('appCode')) {
          params = params.set('appCode', app.code);
        }
        if (app?.id && !params.has('appId')) {
          params = params.set('appId', app.id.toString());
        }
      }
    } catch (error) {
      console.warn('Error parsing data for query parameters:', error);
    }
    
    console.log('getConversations - Query parameters being sent:', params.toString());
    
    return this.http.get<BackendChatResponse<ChatConversacionEntity[]>>(`${this.getChatBase()}/conversations`, { headers, params })
      .pipe(
        map(response => {
          const dataAny: any = response as any;
          const rawArr = Array.isArray(dataAny) ? dataAny : (Array.isArray(dataAny?.data) ? dataAny.data : (Array.isArray(dataAny?.LstItem) ? dataAny.LstItem : (Array.isArray(dataAny?.lstItem) ? dataAny.lstItem : [])));
          const normalized = (rawArr || []).map((it: any) => {
            const id = it.nConversacionesChatId ?? it.nconversacioneschatid ?? it.id ?? 0;
            const name = it.cConversacionesChatNombre ?? it.cconversacioneschatname ?? it.nombre ?? it.cdisplayname ?? '';
            const type = it.cConversacionesChatTipo ?? it.cconversacioneschattype ?? it.tipo ?? '';
            const createdAt = it.dConversacionesChatFechaCreacion ?? it.dtconversacioneschatcreatedat ?? it.fecha_creacion ?? new Date().toISOString();
            const updatedAt = it.dConversacionesChatUltimaActividad ?? it.dtconversacioneschatupdatedat ?? new Date().toISOString();
            const isActive = it.bConversacionesChatEstaActiva ?? it.bconversacioneschatisactive ?? true;
            const appCode = it.cConversacionesChatAppCodigo ?? '';
            const creatorId = it.cConversacionesChatUsuarioCreadorId ?? '';
            const lastText = it.clastmessagetext ?? it.ultimo_mensaje?.texto ?? '';
            const lastSenderId = it.clastmessagesenderid ?? it.ultimo_mensaje?.usuario_id ?? '';
            const lastSenderName = it.clastmessagesendername ?? it.ultimo_mensaje?.usuario_nombre ?? '';
            const lastTime = it.dtlastmessagetimestamp ?? it.ultimo_mensaje?.fecha_envio ?? '';
            const unread = it.nunreadcount ?? it.mensajes_no_leidos ?? 0;
            const participants = it.participants ?? it.participantes ?? [];
            const displayName = it.cdisplayname ?? '';
            return {
              nConversacionesChatId: Number(id),
              cConversacionesChatAppCodigo: appCode,
              cConversacionesChatNombre: String(name),
              cConversacionesChatTipo: String(type),
              cConversacionesChatUsuarioCreadorId: String(creatorId),
              dConversacionesChatFechaCreacion: String(createdAt),
              dConversacionesChatUltimaActividad: String(updatedAt),
              bConversacionesChatEstaActiva: Boolean(isActive),
              clastmessagetext: lastText,
              clastmessagesenderid: lastSenderId,
              clastmessagesendername: lastSenderName,
              dtlastmessagetimestamp: lastTime,
              nunreadcount: unread,
              participants: participants,
              cdisplayname: displayName
            } as ChatConversacionEntity;
          });
          return normalized as ChatConversacionEntity[];
        }),
        switchMap(list => {
          if (Array.isArray(list) && list.length > 0) return of(list);
          const supabaseUrl = (import.meta as any).env?.NG_APP_SUPABASE_URL || '';
          const supabaseKey = (import.meta as any).env?.NG_APP_SUPABASE_ANON_KEY || '';
          const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
          let userId = '';
          try { const u = JSON.parse(storedUser); userId = (u?.id || u?.cPerCodigo || '').toString(); } catch {}
          if (!supabaseUrl || !supabaseKey || !userId) return of(list);
          const headersRpc: Record<string, string> = { 'apikey': supabaseKey, 'Content-Type': 'application/json', 'Accept': 'application/json', 'Prefer': 'return=representation' };
          const mapRow = (it: any): ChatConversacionEntity => {
              const id = it.nconversacioneschatid ?? 0;
              const name = it.cconversacioneschatname ?? it.cdisplayname ?? '';
              const type = it.cconversacioneschattype ?? '';
              const createdAt = it.dtconversacioneschatcreatedat ?? new Date().toISOString();
              const updatedAt = it.dtconversacioneschatupdatedat ?? new Date().toISOString();
              const isActive = it.bconversacioneschatisactive ?? true;
              const lastText = it.clastmessagetext ?? '';
              const lastSenderId = it.clastmessagesenderid ?? '';
              const lastSenderName = it.clastmessagesendername ?? '';
              const lastTime = it.dtlastmessagetimestamp ?? '';
              const unread = it.nunreadcount ?? 0;
              const displayName = it.cdisplayname ?? '';
              return {
                nConversacionesChatId: Number(id),
                cConversacionesChatAppCodigo: '',
                cConversacionesChatNombre: String(name),
                cConversacionesChatTipo: String(type),
                cConversacionesChatUsuarioCreadorId: '',
                dConversacionesChatFechaCreacion: String(createdAt),
                dConversacionesChatUltimaActividad: String(updatedAt),
                bConversacionesChatEstaActiva: Boolean(isActive),
                clastmessagetext: lastText,
                clastmessagesenderid: lastSenderId,
                clastmessagesendername: lastSenderName,
                dtlastmessagetimestamp: lastTime,
                nunreadcount: unread,
                participants: [],
                cdisplayname: displayName
              } as ChatConversacionEntity;
          };
          // Primero intentar el SP solicitado por el flujo
          const uspUrl = `${supabaseUrl}/rest/v1/rpc/USP_Chat_GetUserConversations`;
          const appRaw = localStorage.getItem('application') || sessionStorage.getItem('application') || '{}';
          let appCode = 'SICOM_CHAT_2024';
          let perJurCodigo = 'DEFAULT';
          try { const app = JSON.parse(appRaw); appCode = app?.code || appCode; } catch {}
          try { const u = JSON.parse(storedUser); perJurCodigo = (u?.cPerJurCodigo || 'DEFAULT').toString(); } catch {}
          return this.http.post<any[]>(uspUrl, { cAppCodigo: appCode, cUsuarioId: userId, nPage: 1, nPageSize: 50, perJurCodigo }, { headers: headersRpc }).pipe(
            map(rows => (Array.isArray(rows) ? rows : []).map(mapRow)),
            catchError(() => of([])),
            switchMap(rows => {
              if (Array.isArray(rows) && rows.length > 0) return of(rows);
              // Fallback a la función
              const fnUrl = `${supabaseUrl}/rest/v1/rpc/fn_listar_conversaciones_por_usuario`;
              return this.http.post<any[]>(fnUrl, { cUsuarioId: userId }, { headers: headersRpc }).pipe(
                map(fnRows => (Array.isArray(fnRows) ? fnRows : []).map(mapRow)),
                catchError(() => of([]))
              );
            })
          );
        })
      );
  }

  getConversation(conversationId: string): Observable<ChatConversacionEntity> {
    const headers = this.getAuthHeaders();
    return this.http.get<ChatConversacionEntity>(`${this.getChatBase()}/conversations/${conversationId}`, { headers });
  }

  getConversationParticipants(conversationId: string): Observable<ChatUsuarioEntity[]> {
    const headers = this.getAuthHeaders();
    const modernUrl = `${this.getChatBase()}/conversations/${conversationId}/participants`;
    return this.http.get<any>(modernUrl, { headers }).pipe(
      map((response: any) => {
        const arr = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : (Array.isArray(response?.lstItem) ? response.lstItem : []));
        return (arr || []) as ChatUsuarioEntity[];
      }),
      catchError(() => of([]))
    );
  }

  createConversation(dto: CrearConversacionDto): Observable<ChatConversacionEntity> {
    const headers = this.getAuthHeaders();
    // Enriquecer DTO con formato esperado por backend
    const storedAppRaw = localStorage.getItem('application') || sessionStorage.getItem('application') || '{}';
    const storedUserRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
    let appCode = '';
    let creatorId = '';
    try {
      const appParsed = JSON.parse(storedAppRaw);
      appCode = appParsed?.code || '';
    } catch {}
    try {
      const userParsed = JSON.parse(storedUserRaw);
      creatorId = (userParsed?.id || userParsed?.cPerCodigo || '').toString();
    } catch {}

    const validatedType = ((dto.cConversacionesChatTipo || '').toString().trim() || (dto.participante_ids && dto.participante_ids.length > 2 ? 'group' : 'individual')).toLowerCase();
    const payload: any = {
      ...dto,
      cConversacionesChatTipo: validatedType,
      cAppCodigo: appCode,
      cConversacionesChatUsuarioCreadorId: creatorId,
      participante_ids: Array.isArray(dto.participante_ids) ? dto.participante_ids : [],
      participantes: Array.isArray(dto.participante_ids) ? dto.participante_ids : []
    };
    return this.http.post<any>(`${this.getChatBase()}/conversations`, payload, { headers }).pipe(
      map((response: any) => {
        const dataAny = response as any;
        // Prefer explicit item if present
        let entity = dataAny?.item || dataAny?.Item || dataAny?.data || dataAny?.lstItem || dataAny?.LstItem || dataAny?.resultado || dataAny;
        if (Array.isArray(entity)) {
          entity = entity[0];
        }
        // If resultado is a numeric ID, build a minimal entity
        if (typeof entity === 'number' && entity > 0) {
          const createdId = entity;
          return {
            nConversacionesChatId: createdId,
            cConversacionesChatAppCodigo: '',
            cConversacionesChatNombre: dto.cConversacionesChatNombre,
            cConversacionesChatTipo: dto.cConversacionesChatTipo,
            cConversacionesChatUsuarioCreadorId: '',
            dConversacionesChatFechaCreacion: new Date().toISOString(),
            dConversacionesChatUltimaActividad: new Date().toISOString(),
            bConversacionesChatEstaActiva: true
          } as ChatConversacionEntity;
        }
        return entity as ChatConversacionEntity;
      })
    );
  }

  joinConversation(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/conversations/${conversationId}/join`, {}, { headers });
  }

  leaveConversation(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/conversations/${conversationId}/leave`, {}, { headers });
  }

  // Message endpoints
  getMessages(conversationId: string, page?: number, limit?: number): Observable<ChatMensajeEntity[]> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (limit !== undefined) params = params.set('limit', limit.toString());
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.getChatBase()}/conversations/${conversationId}/messages`, { headers, params }).pipe(
      map((response: any) => {
        const arr = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data
          : (Array.isArray(response?.LstItem) ? response.LstItem
          : (Array.isArray(response?.lstItem) ? response.lstItem : [])));
        const normalized = (arr || []).map((it: any) => {
          const id = it.nMensajesChatId ?? it.nmensajeschatid ?? it.id ?? 0;
          const convId = it.nMensajesChatConversacionId ?? it.nconversacioneschatid ?? it.conversacion_id ?? conversationId;
          const senderId = it.cMensajesChatRemitenteId ?? it.cmensajeschatemisorid ?? it.usuario_id ?? '';
          const senderName = it.cMensajesChatRemitenteNombre ?? it.csendername ?? it.usuario_nombre ?? '';
          const text = it.cMensajesChatTexto ?? it.cmensajeschattexto ?? it.texto ?? '';
          const type = it.cMensajesChatTipo ?? it.cmensajeschattype ?? it.tipo ?? 'text';
          const ts = it.dMensajesChatFechaHora ?? it.dtmensajeschattimestamp ?? it.fecha_envio ?? new Date().toISOString();
          const read = it.bMensajesChatEstaLeido ?? it.bmensajeschatleido ?? it.leido ?? false;
          return {
            nMensajesChatId: Number(id),
            nMensajesChatConversacionId: Number(convId),
            cMensajesChatRemitenteId: String(senderId),
            cMensajesChatRemitenteNombre: senderName || undefined,
            cMensajesChatTexto: String(text),
            cMensajesChatTipo: String(type),
            dMensajesChatFechaHora: String(ts),
            bMensajesChatEstaLeido: Boolean(read)
          } as ChatMensajeEntity;
        });
        return normalized as ChatMensajeEntity[];
      })
    );
  }

  sendMessage(dto: EnviarMensajeDto): Observable<ChatMensajeEntity> {
    const headers = this.getAuthHeaders();
    return this.http.post<ChatMensajeEntity>(`${this.getChatBase()}/messages`, dto, { headers });
  }

  uploadAttachment(conversationId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.getChatBase()}/attachments`, formData, { headers }).pipe(
      map(res => res || { url: '', name: file.name, type: file.type }),
    );
  }

  uploadAttachmentWithProgress(conversationId: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.getChatBase()}/attachments`, formData, {
      headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/conversations/${conversationId}/mark-read`, {}, { headers });
  }

  updateUserStatus(status: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.getChatBase()}/users/status`, { status }, { headers });
  }

  updateConversation(conversationId: string, dto: any): Observable<ChatConversacionEntity> {
    const headers = this.getAuthHeaders();
    return this.http.put<ChatConversacionEntity>(`${this.getChatBase()}/conversations/${conversationId}`, dto, { headers });
  }

  deleteConversation(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.getChatBase()}/conversations/${conversationId}`, { headers });
  }

  markMessageAsRead(messageId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/messages/${messageId}/mark-read`, {}, { headers });
  }

  // Contact endpoints - using users endpoint for contacts
  getContacts(): Observable<ChatUsuarioEntity[]> {
    const headers = this.getAuthHeaders();
    // Para contactos del usuario actual, usar controlador de contactos si aplica
    return this.http.get<BackendResponse<ChatUsuarioEntity[]>>(`${this.apiBase}/v1/contactos/mis-contactos`, { headers }).pipe(
      map(response => {
        if (response.isSuccess && response.data) {
          return response.data;
        } else if (response.isSuccess && response.lstItem) {
          return response.lstItem;
        } else {
          console.warn('Error al obtener contactos:', response.lstError);
          return [];
        }
      })
    );
  }

  private searchUsersViaUsuarios(query: string, companyId?: string, applicationId?: string): Observable<ChatUsuarioEntity[]> {
    const term = (query || '').toLowerCase();
    const list = this.MOCK_USERS;
    if (!term) return of(list);
    return of(list.filter(u => (u.cUsuariosChatNombre || '').toLowerCase().includes(term) || (u.cUsuariosChatEmail || '').toLowerCase().includes(term)));
  }

  private searchUsersViaContactos(query: string): Observable<ChatUsuarioEntity[]> {
    let headers = this.getAuthHeaders();
    const contactoBase = `${this.apiBase}/v1/contactos/search-users`;
    let params = new HttpParams().set('terminoBusqueda', query);
    
    // Agregar empresa y aplicación desde el usuario actual si están disponibles
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentApp = JSON.parse(localStorage.getItem('application') || '{}');
    
    // Crear nuevo objeto headers para no modificar el original
    const enhancedHeaders = { ...headers };
    if (currentUser.cPerJurCodigo) {
      enhancedHeaders['X-Empresa-Id'] = currentUser.cPerJurCodigo;
    }
    if (currentApp.id) {
      enhancedHeaders['X-Aplicacion-Id'] = currentApp.id;
    }
    
    const tipoListado = (localStorage.getItem('tipo_listado_contactos') || '').toString();
    if (tipoListado) params = params.set('tipoListado', tipoListado);
    
    console.log('Searching users via contactos with headers:', enhancedHeaders);
    return this.http.get<BackendResponse<ChatUsuarioEntity[]>>(contactoBase, { headers: enhancedHeaders, params }).pipe(
      map(response => {
        if (response.isSuccess && response.data) {
          return response.data;
        } else if (response.isSuccess && response.lstItem) {
          return response.lstItem;
        } else {
          console.warn('Error al buscar usuarios:', response.lstError);
          return [];
        }
      })
    );
  }

  searchContacts(query: string, companyId?: string, applicationId?: string): Observable<ChatUsuarioEntity[]> {
    const rawSource = (localStorage.getItem('chat_contact_source') || 'contactos').toString();
    const source = rawSource.toLowerCase();
    
    // Obtener el modo de gestión de contactos desde la configuración
    const modoGestion = localStorage.getItem('chat_modo_gestion_contactos') || 'LOCAL';
    console.log('Modo de gestión actual:', modoGestion, 'Fuente seleccionada:', source);
    
    // Lógica según el modo de gestión
    if (modoGestion === 'API_EXTERNA') {
      // Modo API_EXTERNA: Solo usuarios externos
      if (source === 'usuarios') {
        return this.searchUsersViaUsuarios(query, companyId, applicationId);
      }
      const term = (query || '').toLowerCase();
      const list = this.MOCK_USERS;
      if (!term) return of(list);
      return of(list.filter(u => (u.cUsuariosChatNombre || '').toLowerCase().includes(term) || (u.cUsuariosChatEmail || '').toLowerCase().includes(term)));
    }
    
    if (modoGestion === 'LOCAL') {
      // Modo LOCAL: Solo contactos locales (ChatContacto)
      if (source === 'contactos' || source === 'chatcontacto') {
        return this.searchUsersViaContactos(query);
      }
      console.warn('Modo LOCAL: Solo se permiten contactos locales');
      return this.searchUsersViaContactos(query);
    }
    
    if (modoGestion === 'HIBRIDO') {
      // Modo HIBRIDO: Contactos locales + usuarios externos
      if (source === 'usuarios') {
        return this.searchUsersViaUsuarios(query, companyId, applicationId);
      }
      return this.searchUsersViaContactos(query);
    }
    
    const term = (query || '').toLowerCase();
    const list = this.MOCK_USERS;
    if (!term) return of(list);
    return of(list.filter(u => (u.cUsuariosChatNombre || '').toLowerCase().includes(term) || (u.cUsuariosChatEmail || '').toLowerCase().includes(term)));
  }

  verifyChatPermission(usuario2Id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5406/api'}/v1/contactos/verify-chat-permission`;
    return this.http.post<any>(url, { Usuario2Id: usuario2Id }, { headers });
  }

  sendContactRequestContacto(usuarioDestinoId: string, mensaje?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5406/api'}/v1/contactos/send-request`;
    return this.http.post<any>(url, { UsuarioDestinoId: usuarioDestinoId, Mensaje: mensaje || '' }, { headers });
  }

  sendContactRequest(dto: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.getChatBase()}/contact-requests`, dto, { headers });
  }

  getContactRequests(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getChatBase()}/contact-requests`, { headers });
  }

  respondToContactRequest(dto: any): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/contact-requests/respond`, dto, { headers });
  }

  removeContact(contactId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.getChatBase()}/contacts/${contactId}`, { headers });
  }

  getMessageStatus(messageId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.getChatBase()}/messages/${messageId}/status`, { headers });
  }

  startTyping(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/conversations/${conversationId}/typing/start`, {}, { headers });
  }

  stopTyping(conversationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.getChatBase()}/conversations/${conversationId}/typing/stop`, {}, { headers });
  }

  // Contactos (listas y estadísticas)
  getMyContacts(status?: string): Observable<ChatUsuarioEntity[]> {
    const headers = this.getAuthHeaders();
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
    const appRaw = localStorage.getItem('application') || sessionStorage.getItem('application') || '{}';
    const user = JSON.parse(userRaw);
    const app = JSON.parse(appRaw);
    let params = new HttpParams();
    
    // Use English parameter names instead of Spanish
    if (status) {
      // Map English status to Spanish for backend compatibility if needed
      const statusMap: Record<string, string> = {
        'accepted': 'Aceptado',
        'pending': 'Pendiente',
        'rejected': 'Rechazado',
        'blocked': 'Bloqueado'
      };
      const backendStatus = statusMap[status.toLowerCase()] || status;
      params = params.set('estado', backendStatus);
    }
    
    if (user?.id) params = params.set('userId', String(user.id));
    if (user?.cPerJurCodigo) params = params.set('cPerJurCodigo', String(user.cPerJurCodigo));
    if (user?.cPerCodigo) params = params.set('cPerCodigo', String(user.cPerCodigo));
    if (app?.id) params = params.set('aplicacionId', String(app.id));
    
    return this.http.get<ChatUsuarioEntity[]>(`${this.apiBase}/v1/contactos/mis-contactos`, { headers, params });
  }

  getPendingContactRequests(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiBase}/v1/contactos/pending-requests`, { headers });
  }

  getContactStats(): Observable<any> {
    const headers = this.getAuthHeaders();
    const userRaw = localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
    const appRaw = localStorage.getItem('application') || sessionStorage.getItem('application') || '{}';
    const user = JSON.parse(userRaw);
    const app = JSON.parse(appRaw);
    let params = new HttpParams();
    
    // Add proper parameters for SP execution
    if (user?.id) params = params.set('userId', String(user.id));
    if (user?.cPerJurCodigo) params = params.set('cPerJurCodigo', String(user.cPerJurCodigo));
    if (user?.cPerCodigo) params = params.set('cPerCodigo', String(user.cPerCodigo));
    if (app?.id) params = params.set('aplicacionId', String(app.id));
    if (app?.code) params = params.set('aplicacionCodigo', app.code);
    
    return this.http.get<any>(`${this.apiBase}/v1/contactos/stats`, { headers, params });
  }
}
