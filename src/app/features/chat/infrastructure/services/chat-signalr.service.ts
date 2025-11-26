import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// Domain Models
import { ChatMessage, ChatUser, Conversation, TypingIndicator } from '../../domain/models/chat.model';
import { AuthService } from '../../../auth/infrastructure/services/auth.service';
import { ChatAdapter } from '../adapters/chat.adapter';

@Injectable({
  providedIn: 'root'
})
export class ChatSignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionState = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private connectionId: string | null = null; // Track connection instance
  private connectionLock = false; // Prevent multiple simultaneous connections
  private initializationCount = 0; // Track how many times connection is initialized
  
  // Message events
  private messageReceived = new Subject<ChatMessage>();
  private messageDelivered = new Subject<{ messageId: string; deliveredAt: Date }>();
  private messageRead = new Subject<{ messageId: string; readAt: Date }>();
  
  // User events
  private userOnline = new Subject<{ userId: string; isOnline: boolean }>();
  private userTyping = new Subject<TypingIndicator>();
  
  // Conversation events
  private conversationUpdated = new Subject<{ conversationId: string; lastActivity: Date }>();

  constructor(private authService: AuthService) {
    // Don't initialize connection immediately - wait for explicit call
    // this.initializeConnection();
  }

  private initializeConnection(): void {
    this.initializationCount++;
    console.log(`=== SIGNALR INITIALIZATION DEBUG (Attempt #${this.initializationCount}) ===`);
    
    // Check if connection already exists
    if (this.hubConnection) {
      console.log(`Connection already exists (state: ${this.hubConnection.state}), skipping initialization`);
      return;
    }
    
    // Debug: Verificar datos en localStorage
    console.log('Local/Session storage contents:');
    console.log('- auth_token:', (localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')) ? 'EXISTS' : 'MISSING');
    console.log('- user:', (localStorage.getItem('user') || sessionStorage.getItem('user')) ? 'EXISTS' : 'MISSING');
    console.log('- application:', (localStorage.getItem('application') || sessionStorage.getItem('application')) ? 'EXISTS' : 'MISSING');
    
    if (localStorage.getItem('user') || sessionStorage.getItem('user')) {
      try {
        const userJson = localStorage.getItem('user') || sessionStorage.getItem('user')!;
        const user = JSON.parse(userJson);
        console.log('- User data:', user);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    
    if (localStorage.getItem('application') || sessionStorage.getItem('application')) {
      try {
        const appJson = localStorage.getItem('application') || sessionStorage.getItem('application')!;
        const app = JSON.parse(appJson);
        console.log('- Application data:', app);
      } catch (e) {
        console.error('Error parsing application:', e);
      }
    }

    // Build complete authentication data with backend-compatible parameter names
    const authData = this.buildBackendCompatibleAuthData();
    console.log('=== BACKEND-COMPATIBLE AUTHENTICATION DATA ===');
    console.log('Auth data for backend:', authData);
    
    const baseHubUrl = import.meta.env.NG_APP_SIGNALR_HUB_URL || 'http://localhost:5406/chathub';
    
    console.log('Using SSE/LongPolling transports to keep token in headers');
    
    // Construir URL incluyendo los query params que el hub espera
    // Construir URL con parámetros requeridos por el hub (no sensibles). El token irá como access_token en query.
    const connectionUrl = this.buildConnectionUrlWithParams(baseHubUrl, authData);
    console.log('=== CREATING SIGNALR CONNECTION ===');
    console.log('Connection URL:', connectionUrl);
    console.log('Headers:', this.getAuthHeaders());
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(connectionUrl, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        accessTokenFactory: () => {
          const token = this.authService.getToken();
          return token || '';
        },
        headers: this.getAuthHeadersWithUserApp() // Add headers for HTTP fallback transports
      })
      .withAutomaticReconnect([0, 2000, 5000])
      .configureLogging(LogLevel.Debug)
      .build();

    console.log('SignalR connection created successfully');
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

    console.log('Setting up SignalR event handlers...');

    // Message events
    this.hubConnection.on('ReceiveMessage', (message: any) => {
      console.log('SignalR MessageReceived:', message);
      this.messageReceived.next(this.mapToChatMessage(message));
    });

    this.hubConnection.on('MessageDelivered', (data: any) => {
      console.log('SignalR MessageDelivered:', data);
      this.messageDelivered.next({
        messageId: data.messageId?.toString() || '',
        deliveredAt: new Date(data.deliveredAt || Date.now())
      });
    });

    this.hubConnection.on('MessageRead', (data: any) => {
      console.log('SignalR MessageRead:', data);
      this.messageRead.next({
        messageId: data.messageId?.toString() || '',
        readAt: new Date(data.readAt || Date.now())
      });
    });

    // User events
    this.hubConnection.on('UserConnected', (data: any) => {
      console.log('SignalR UserConnected:', data);
      this.userOnline.next({
        userId: data.userId?.toString() || '',
        isOnline: true
      });
    });

    this.hubConnection.on('UserDisconnected', (data: any) => {
      console.log('SignalR UserDisconnected:', data);
      this.userOnline.next({
        userId: data.userId?.toString() || '',
        isOnline: false
      });
    });

    this.hubConnection.on('UserOnline', (data: any) => {
      console.log('SignalR UserOnline:', data);
      this.userOnline.next({
        userId: data.userId?.toString() || '',
        isOnline: data.isOnline ?? true
      });
    });

    this.hubConnection.on('UserTyping', (data: any) => {
      console.log('SignalR UserTyping:', data);
      this.userTyping.next({
        conversationId: data.conversationId?.toString() || '',
        userId: data.userId?.toString() || '',
        userName: data.userName || '',
        isTyping: data.isTyping ?? true,
        timestamp: new Date(data.timestamp || Date.now())
      });
    });

    // Connection events
    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed:', error);
      this.connectionState.next('disconnected');
      
      // Only attempt reconnection if we haven't exceeded max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        
        console.log(`Attempting to reconnect SignalR (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);
        setTimeout(() => {
          this.startConnection().catch(err => {
            console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, err);
          });
        }, delay);
      } else {
        console.error('Max reconnection attempts reached. Manual reconnection required.');
      }
    });

    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
      this.connectionState.next('connecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected successfully');
      this.connectionState.next('connected');
      this.reconnectAttempts = 0; // Reset attempts on successful reconnection
      // Re-join conversations after reconnection
      this.rejoinConversations();
    });

    console.log('SignalR event handlers setup complete');
  }

  private getAuthData(): Record<string, string> {
    const authData: Record<string, string> = {};
    
    // Obtener token de autenticación - try both localStorage and sessionStorage
    let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      // Fallback to auth service
      token = this.authService.getToken();
    }
    if (token) {
      authData['token'] = token;
      
      // Extract app_code from JWT token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.app_code) {
          authData['appCode'] = payload.app_code;
          console.log('Extracted app_code from JWT token:', payload.app_code);
        }
      } catch (error) {
        console.warn('Error extracting app_code from JWT token:', error);
      }
    }

    // Obtener información de la aplicación del localStorage (fallback)
    try {
      const storedApp = localStorage.getItem('application') || sessionStorage.getItem('application');
      if (storedApp && !authData['appCode']) {
        const app = JSON.parse(storedApp);
        if (app?.code) authData['appCode'] = app.code;
        if (app?.id) authData['appId'] = app.id.toString();
      }
    } catch (error) {
      console.warn('Error parsing application from localStorage:', error);
    }

    // Códigos de persona/usuario - prioritize localStorage data
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Use adapter to convert User model to backend entity parameters
        const userParams = ChatAdapter.userToBackendEntityParams(user);
        Object.assign(authData, userParams);
        
      } else {
        // Fallback to auth service current user
        const currentUser = this.authService.getCurrentUserValue();
        if (currentUser) {
          // Use adapter to convert User model to backend entity parameters
          const userParams = ChatAdapter.userToBackendEntityParams(currentUser);
          Object.assign(authData, userParams);
        }
      }
    } catch (error) {
      console.warn('Error getting user data for auth:', error);
    }

    console.log('SignalR Auth Data:', authData);
    return authData;
  }

  private buildQueryString(params: Record<string, string>): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString();
  }

  private buildBackendCompatibleAuthData(): Record<string, string> {
    const authData: Record<string, string> = {};
    
    // Obtener token de autenticación - try both localStorage and sessionStorage
    let token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (!token) {
      // Fallback to auth service
      token = this.authService.getToken();
    }
    
    if (token) {
      // Extract app_code from JWT token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload?.app_code) {
          authData['appCode'] = payload.app_code;
          authData['app_code'] = payload.app_code; // Backend compatible
          console.log('Extracted app_code from JWT token:', payload.app_code);
        }
        
        // Extract user data from JWT token
        if (payload?.user_id) {
          authData['userId'] = payload.user_id;
          authData['nPerId'] = payload.user_id; // Backend compatible
          authData['cPerCodigo'] = payload.user_id; // Backend compatible
        }
        
        if (payload?.per_jur_codigo) {
          authData['perJurCodigo'] = payload.per_jur_codigo;
          authData['cPerJurCodigo'] = payload.per_jur_codigo; // Backend compatible
        }
        
        if (payload?.per_codigo) {
          authData['perCodigo'] = payload.per_codigo;
          authData['cPerCodigo'] = payload.per_codigo; // Backend compatible
        }
      } catch (error) {
        console.warn('Error extracting data from JWT token:', error);
      }
    }

    // Obtener información de la aplicación del localStorage (fallback)
    try {
      const storedApp = localStorage.getItem('application');
      if (storedApp) {
        const app = JSON.parse(storedApp);
        if (app?.code && !authData['appCode']) {
          authData['appCode'] = app.code;
          authData['app_code'] = app.code; // Backend compatible
        }
        if (app?.id) {
          authData['appId'] = app.id.toString();
        }
      }
    } catch (error) {
      console.warn('Error parsing application from localStorage:', error);
    }

    // Códigos de persona/usuario - prioritize localStorage data
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Use adapter to convert User model to backend entity parameters
        const userParams = ChatAdapter.userToBackendEntityParams(user);
        
        // Merge with JWT data (JWT data takes precedence)
        Object.keys(userParams).forEach(key => {
          if (!authData[key]) {
            authData[key] = userParams[key];
          }
        });
        
      } else {
        // Fallback to auth service current user
        const currentUser = this.authService.getCurrentUserValue();
        if (currentUser) {
          const userParams = ChatAdapter.userToBackendEntityParams(currentUser);
          
          // Merge with JWT data (JWT data takes precedence)
          Object.keys(userParams).forEach(key => {
            if (!authData[key]) {
              authData[key] = userParams[key];
            }
          });
        }
      }
    } catch (error) {
      console.warn('Error getting user data for auth:', error);
    }

    console.log('Backend-compatible auth data:', authData);
    return authData;
  }

  private buildWebSocketQueryParams(authData: Record<string, string>): string {
    // Build query string specifically for WebSocket with backend-compatible parameter names
    // Hybrid authentication approach:
    // 1. For WebSocket: User/app data in query parameters, JWT token in Authorization header (via accessTokenFactory)
    // 2. For HTTP transports: All authentication via Authorization header and query parameters
    const queryParams = new URLSearchParams();
    
    // Add app code (backend expects 'appCode')
    if (authData['app_code']) {
      queryParams.append('appCode', authData['app_code']);
    }
    
    // Add user data with backend-expected names
    if (authData['nPerId']) {
      queryParams.append('nPerId', authData['nPerId']);
    }
    if (authData['cPerCodigo']) {
      queryParams.append('cPerCodigo', authData['cPerCodigo']);
    }
    if (authData['cPerJurCodigo']) {
      queryParams.append('cPerJurCodigo', authData['cPerJurCodigo']);
    }
    
    // JWT token is handled by accessTokenFactory for HTTP transports
    // For WebSocket: JWT token will be added by SignalR via accessTokenFactory
    // This keeps the URL clean and follows proper authentication patterns
    
    console.log('WebSocket query parameters (user/app data only, JWT handled by accessTokenFactory):', queryParams.toString());
    return queryParams.toString();
  }

  private buildConnectionUrlWithParams(baseUrl: string, authData: Record<string, string>): string {
    // Build the connection URL with authentication parameters
    // Hybrid approach:
    // - User/app data in query parameters (needed for all transports)
    // - JWT token handled by accessTokenFactory for proper authentication
    const webSocketParams = this.buildWebSocketQueryParams(authData);
    
    // Build the final URL with user/app data in query string
    const separator = baseUrl.includes('?') ? '&' : '?';
    const finalUrl = webSocketParams ? `${baseUrl}${separator}${webSocketParams}` : baseUrl;
    
    console.log('=== SIGNALR CONNECTION URL WITH AUTH ===');
    console.log('Base URL:', baseUrl);
    console.log('WebSocket query parameters (user/app data):', webSocketParams);
    console.log('Final URL:', finalUrl);
    console.log('Authentication: Hybrid approach - user/app data in query, JWT via accessTokenFactory');
    
    return finalUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Hybrid authentication approach:
    // 1. For WebSocket: Authentication data in query parameters (browser requirement)
    // 2. For HTTP transports (SSE, Long Polling): JWT token in Authorization header
    
    const token = this.authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header added for HTTP transports (SSE/Long Polling)');
    } else {
      console.log('No JWT token found for Authorization header');
    }
    
    return headers;
  }

  private getAuthHeadersWithUserApp(): Record<string, string> {
    const headers: Record<string, string> = this.getAuthHeaders();
    const authData = this.buildBackendCompatibleAuthData();
    if (authData['app_code']) headers['appCode'] = authData['app_code'];
    if (authData['cPerCodigo']) headers['cPerCodigo'] = authData['cPerCodigo'];
    if (authData['cPerJurCodigo']) headers['cPerJurCodigo'] = authData['cPerJurCodigo'];
    if (authData['nPerId']) headers['nPerId'] = authData['nPerId'];
    return headers;
  }

  private mapToChatMessage(backendMessage: any): ChatMessage {
    // Handle both frontend DTO format and backend ChatMensajeDto format
    return {
      id: backendMessage.nMensajesChatId?.toString() || backendMessage.id?.toString() || '',
      conversationId: backendMessage.nMensajesChatConversacionId?.toString() || backendMessage.conversationId?.toString() || backendMessage.conversacion_id?.toString() || '',
      senderId: backendMessage.cMensajesChatRemitenteId?.toString() || backendMessage.senderId?.toString() || backendMessage.usuario_id?.toString() || '',
      senderName: backendMessage.cMensajesChatRemitenteNombre || backendMessage.senderName || backendMessage.usuario_nombre || '',
      content: backendMessage.cMensajesChatTexto || backendMessage.content || backendMessage.texto || '',
      type: this.mapMessageType(backendMessage.cMensajesChatTipo || backendMessage.type || backendMessage.tipo),
      timestamp: new Date(backendMessage.dMensajesChatFechaHora || backendMessage.timestamp || backendMessage.fecha_envio || Date.now()),
      isRead: backendMessage.bMensajesChatEstaLeido ?? backendMessage.isRead ?? backendMessage.leido ?? false
    };
  }

  private rejoinConversations(): void {
    console.log('Rejoining conversations after reconnection...');
    // Aquí deberías implementar la lógica para re-unirse a las conversaciones activas
    // Por ahora solo logueamos que se intentó
    console.log('Rejoin conversations completed');
  }

  private mapMessageType(type: string): 'text' | 'image' | 'file' | 'audio' | 'system' {
    const typeMap: Record<string, 'text' | 'image' | 'file' | 'audio' | 'system'> = {
      'text': 'text',
      'TEXT': 'text',
      'image': 'image',
      'IMAGEN': 'image',
      'audio': 'audio',
      'AUDIO': 'audio',
      'file': 'file',
      'ARCHIVO': 'file',
      'system': 'system',
      'SISTEMA': 'system'
    };
    return typeMap[type] || 'text';
  }

  // Connection methods
  async startConnection(): Promise<void> {
    // Generate unique connection ID to track this attempt
    const connectionAttemptId = `signalr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[${connectionAttemptId}] Starting SignalR connection attempt...`);

    // Prevent multiple simultaneous connection attempts with connection lock
    if (this.connectionLock) {
      console.log(`[${connectionAttemptId}] SignalR connection locked - another connection in progress`);
      return this.connectionPromise || Promise.resolve();
    }

    // Set connection lock
    this.connectionLock = true;

    try {
      // Check if already connected
      if (this.hubConnection?.state === 'Connected') {
        console.log(`[${connectionAttemptId}] SignalR connection already established`);
        return Promise.resolve();
      }

      // Check if connection is in progress
      if (this.hubConnection?.state === 'Connecting') {
        console.log(`[${connectionAttemptId}] SignalR connection already in progress, waiting...`);
        return this.connectionPromise || Promise.resolve();
      }

      // Initialize connection if not already done
      if (!this.hubConnection) {
        console.log(`[${connectionAttemptId}] Initializing SignalR connection...`);
        this.initializeConnection();
      }

      this.connectionId = connectionAttemptId;
      this.isConnecting = true;
      this.connectionPromise = this.doStartConnection(connectionAttemptId);
      return this.connectionPromise;
    } finally {
      // Release connection lock
      this.connectionLock = false;
    }
  }

  private async doStartConnection(connectionAttemptId: string): Promise<void> {
    try {
      console.log(`[${connectionAttemptId}] Starting SignalR connection...`);
      console.log(`[${connectionAttemptId}] Connection URL:`, this.hubConnection?.baseUrl);
      this.connectionState.next('connecting');
      
      // Log connection attempt details
      console.log(`[${connectionAttemptId}] === SIGNALR CONNECTION ATTEMPT ===`);
      console.log(`[${connectionAttemptId}] Attempting to connect to:`, this.hubConnection?.baseUrl);
      console.log(`[${connectionAttemptId}] Transport type:`, this.hubConnection?.connectionId ? 'WebSocket' : 'Unknown');
      
      // Log the actual URL that will be used for the negotiate request
      const negotiateUrl = this.hubConnection?.baseUrl?.replace('/chathub', '/chathub/negotiate');
      console.log(`[${connectionAttemptId}] Expected negotiate URL:`, negotiateUrl);
      
      await this.hubConnection?.start();
      this.connectionState.next('connected');
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      console.log(`[${connectionAttemptId}] === SIGNALR CONNECTION SUCCESS ===`);
      console.log(`[${connectionAttemptId}] SignalR connection established successfully`);
      console.log(`[${connectionAttemptId}] Connection ID:`, this.hubConnection?.connectionId);
      console.log(`[${connectionAttemptId}] Connection State:`, this.hubConnection?.state);
      console.log(`[${connectionAttemptId}] Transport Type:`, (this.hubConnection as any)?.connection?.transport?.constructor?.name || 'Unknown');
      
      // Log WebSocket-specific info if available
      if ((this.hubConnection as any)?.connection?.transport?.webSocket) {
        console.log(`[${connectionAttemptId}] WebSocket readyState:`, (this.hubConnection as any).connection.transport.webSocket.readyState);
        console.log(`[${connectionAttemptId}] WebSocket URL:`, (this.hubConnection as any).connection.transport.webSocket.url);
      }
      
    } catch (error) {
      this.connectionState.next('disconnected');
      console.error(`[${connectionAttemptId}] === SIGNALR CONNECTION ERROR ===`);
      console.error(`[${connectionAttemptId}] Error starting SignalR connection:`, error);
      console.error(`[${connectionAttemptId}] Connection details:`, {
        url: this.hubConnection?.baseUrl,
        state: this.hubConnection?.state,
        connectionId: this.hubConnection?.connectionId,
        transport: (this.hubConnection as any)?.connection?.transport?.constructor?.name || 'Unknown'
      });
      
      // Log specific WebSocket error details if available
      if ((this.hubConnection as any)?.connection?.transport?.webSocket) {
        console.error(`[${connectionAttemptId}] WebSocket readyState:`, (this.hubConnection as any).connection.transport.webSocket.readyState);
        console.error(`[${connectionAttemptId}] WebSocket URL:`, (this.hubConnection as any).connection.transport.webSocket.url);
      }
      
      throw error;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
      this.connectionId = null; // Clear connection attempt ID
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.stop();
        this.connectionState.next('disconnected');
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
        throw error;
      }
    }
    
    // Reset connection state
    this.connectionPromise = null;
    this.isConnecting = false;
    this.connectionLock = false;
    this.connectionId = null;
  }

  // Message methods
  async sendMessage(conversationId: string, content: string, type: string = 'TEXT'): Promise<ChatMessage> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      throw new Error('SignalR connection is not established');
    }

    try {
      const response = await this.hubConnection.invoke('SendMessage', {
        nConversacionesChatId: parseInt(conversationId),
        cMensajesChatTexto: content,
        cMensajesChatTipo: type
      });
      console.log('Message sent via SignalR, response:', response);
      // Mapear la respuesta del backend a nuestro modelo ChatMessage
      return this.mapToChatMessage(response);
    } catch (error) {
      console.error('Error sending message via SignalR:', error);
      throw error;
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      return;
    }
    try {
      const idNum = Number(conversationId);
      if (!Number.isFinite(idNum) || idNum <= 0) {
        console.warn('joinConversation skipped: invalid conversationId', conversationId);
        return;
      }
      await this.hubConnection.invoke('JoinConversation', Math.trunc(idNum));
    } catch (error) {
      console.error('Error joining conversation:', error);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
      return;
    }
    try {
      await this.hubConnection.invoke('LeaveConversation', parseInt(conversationId));
    } catch (error) {
      console.error('Error leaving conversation:', error);
    }
  }

  // Typing indicators (desactivado porque no está implementado en el backend)
  async startTyping(conversationId: string): Promise<void> {
    console.log('Typing indicators not implemented in backend');
    // await this.hubConnection?.invoke('StartTyping', parseInt(conversationId));
  }

  async stopTyping(conversationId: string): Promise<void> {
    console.log('Typing indicators not implemented in backend');
    // await this.hubConnection?.invoke('StopTyping', parseInt(conversationId));
  }

  // Observable streams
  get connectionState$(): Observable<'disconnected' | 'connecting' | 'connected'> {
    return this.connectionState.asObservable();
  }

  get messageReceived$(): Observable<ChatMessage> {
    return this.messageReceived.asObservable();
  }

  get messageDelivered$(): Observable<{ messageId: string; deliveredAt: Date }> {
    return this.messageDelivered.asObservable();
  }

  get messageRead$(): Observable<{ messageId: string; readAt: Date }> {
    return this.messageRead.asObservable();
  }

  get userOnline$(): Observable<{ userId: string; isOnline: boolean }> {
    return this.userOnline.asObservable();
  }

  get userTyping$(): Observable<TypingIndicator> {
    return this.userTyping.asObservable();
  }

  get conversationUpdated$(): Observable<{ conversationId: string; lastActivity: Date }> {
    return this.conversationUpdated.asObservable();
  }

  // Utility methods
  isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState.value;
  }
}
