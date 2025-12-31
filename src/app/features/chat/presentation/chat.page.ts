import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, forkJoin, of, switchMap } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { StorageService } from '../../../core/services/storage.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ApplicationSettings } from '../../admin/domain/entities/application.entity';
import { CompanyConfiguration } from '../../admin/domain/entities/company.entity';
import { ApplicationRepository } from '../../admin/domain/repositories/application.repository';
import { GetApplicationConfigUseCase } from '../../admin/domain/use-cases/get-application-config.use-case';
import { GetCompanyConfigUseCase } from '../../admin/domain/use-cases/get-company-config.use-case';
import { AuthService } from '../../auth/infrastructure/services/auth.service';
import { ChatMessage, ChatUser, Conversation } from '../domain/models/chat.model';
import { CreateConversationUseCase } from '../domain/use-cases/create-conversation.use-case';
import { GetContactsUseCase } from '../domain/use-cases/get-contacts.use-case';
import { GetConversationsUseCase } from '../domain/use-cases/get-conversations.use-case';
import { GetCurrentUserUseCase } from '../domain/use-cases/get-current-user.use-case';
import { GetMessagesUseCase } from '../domain/use-cases/get-messages.use-case';
import { SearchContactsUseCase } from '../domain/use-cases/search-contacts.use-case';
import { SendMessageUseCase } from '../domain/use-cases/send-message.use-case';
import { ChatApiService } from '../infrastructure/services/chat-api.service';
import { ChatSignalRService } from '../infrastructure/services/chat-signalr.service';
import { TranslationService } from '../infrastructure/services/translation.service';
import { ChatSidebarComponent } from './components/chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { AudioEditorPresenter } from './components/media-editor/audio-editor.presenter';
import { ImageEditorPresenter } from './components/media-editor/image-editor.presenter';
import { VideoEditorPresenter } from './components/media-editor/video-editor.presenter';
import { TranslationLoaderComponent } from './components/translation-loader/translation-loader.component';
import { TranslateLabelDirective } from './directives/translate-label.directive';
import { ValidationService } from './services/validation.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatSidebarComponent, ChatWindowComponent, TranslationLoaderComponent, TranslateLabelDirective, ImageEditorPresenter, AudioEditorPresenter, VideoEditorPresenter, MatSnackBarModule],
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private searchTimeout: any;

  // Use cases
  private getCurrentUserUseCase = inject(GetCurrentUserUseCase);
  private getConversationsUseCase = inject(GetConversationsUseCase);
  private getContactsUseCase = inject(GetContactsUseCase);
  private getMessagesUseCase = inject(GetMessagesUseCase);
  private sendMessageUseCase = inject(SendMessageUseCase);
  private createConversationUseCase = inject(CreateConversationUseCase);
  private searchContactsUseCase = inject(SearchContactsUseCase);
  private getApplicationConfigUseCase = inject(GetApplicationConfigUseCase);
  private getCompanyConfigUseCase = inject(GetCompanyConfigUseCase);

  // Services
  private signalRService = inject(ChatSignalRService);
  private authService = inject(AuthService);
  private chatApiService = inject(ChatApiService);
  private http = inject(HttpClient);
  private applicationRepository = inject(ApplicationRepository);
  private translationService = inject(TranslationService);
  private snackBar = inject(MatSnackBar);
  private themeService = inject(ThemeService);
  private storageService: StorageService = inject(StorageService);
  private validationService = inject(ValidationService);

  // State
  currentUser: ChatUser | null = null;
  conversations: Conversation[] = [];
  displayedConversations: Conversation[] = [];
  selectedConversationId: string | null = null;
  selectedUser: ChatUser | null = null;
  messages: ChatMessage[] = [];
  currentUserId: string | null = null;
  typingUsers: ChatUser[] = [];
  opened: boolean = false;
  
  // Configuration state
  applicationConfig: ApplicationSettings | null = null;
  companyConfig: CompanyConfiguration | null = null;
  // Configuración efectiva resultante del merge
  effectiveConfig: Partial<ApplicationSettings & CompanyConfiguration> | null = null;
  
  // Contact selection state
  showContactModal: boolean = false;
  availableContacts: ChatUser[] = [];
  filteredContacts: ChatUser[] = [];
  contactSearchTerm: string = '';
  isLoadingContacts: boolean = false;
  isSearchMode: boolean = false;
  conversationSearchQuery: string = '';
  pendingSelectedContact: ChatUser | null = null;
  pendingConversationName: string = '';
  creatingConversation: boolean = false;
  creationError: string | null = null;
  pendingContactRequests: any[] = [];

  // Loading states
  isLoadingConversations: boolean = false;
  isLoadingMessages: boolean = false;
  isLoadingOlderMessages: boolean = false;
  isSendingMessage: boolean = false;
  isLoadingConfigurations: boolean = false;

  // Chat states
  isTyping: boolean = false;
  hasMoreMessages: boolean = true;
  isConnected: boolean = false;
  signalRInitialized: boolean = false; // Flag to prevent multiple initializations
  private messageSentTimestamps: number[] = [];
  pendingAttachmentFile: File | null = null;
  uploadProgress: number | null = null;
  pendingAttachments: Array<{ id: string; file: File; type: 'image' | 'audio' | 'video' | 'file'; previewUrl: string; uploadProgress?: number | null }> = [];

  private async showTranslatedError(message: string): Promise<void> {
    try {
      const translated = await this.translationService.translateMessage(message, this.currentLanguage);
      this.snackBar.open(translated || message, 'Cerrar', { duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['error-snackbar'] });
    } catch {
      this.snackBar.open(message, 'Cerrar', { duration: 4000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['error-snackbar'] });
    }
  }

  private extractBackendErrorMessage(error: any): string {
    const err = error?.error ?? error;
    const fromIsError = err?.isError?.cDescripcion || err?.isError?.descripcion || '';
    const fromLstError = (err?.lstError && Array.isArray(err.lstError) && err.lstError.length > 0) ? err.lstError[0] : '';
    const fromMessage = err?.message || error?.message || '';
    const fromResult = err?.resultado && typeof err.resultado === 'string' ? err.resultado : '';
    const text = fromIsError || fromLstError || fromResult || fromMessage || 'Error al procesar la solicitud';
    return String(text);
  }

  // Mock contacts for UI testing
  private readonly USE_MOCK_CONTACTS: boolean = false;
  private readonly MOCK_CONTACTS: ChatUser[] = [
    { id: 'u1', name: 'Ana García', email: 'ana.garcia@example.com', role: 'user', isActive: true, isOnline: true, companyId: 'c1', companyName: 'Acme Corp' },
    { id: 'u2', name: 'Luis Fernández', email: 'luis.fernandez@example.com', role: 'user', isActive: true, isOnline: false, companyId: 'c2', companyName: 'Globant' },
    { id: 'u3', name: 'María López', email: 'maria.lopez@example.com', role: 'user', isActive: true, isOnline: true, companyId: 'c1', companyName: 'Acme Corp' },
    { id: 'u4', name: 'Jorge Pérez', email: 'jorge.perez@example.com', role: 'user', isActive: true, isOnline: false },
    { id: 'u5', name: 'Sofía Martínez', email: 'sofia.martinez@example.com', role: 'user', isActive: true, isOnline: true },
    { id: 'u6', name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'user', isActive: true, isOnline: false },
    { id: 'u7', name: 'Lucía Herrera', email: 'lucia.herrera@example.com', role: 'user', isActive: true, isOnline: true },
    { id: 'u8', name: 'Diego Castro', email: 'diego.castro@example.com', role: 'user', isActive: true, isOnline: false }
  ];

  // Translation settings
  isTranslationEnabled: boolean = true; // Enable translation by default for Spanish
  currentLanguage: string = 'es';
  translationStatus: string = 'not-initialized';
  translationError: string | null = null;
  translationDownloadProgress: number = 0;

  // Theme settings
  currentTheme: string = this.themeService.getCurrentTheme();
  currentPrimaryColor: string = this.themeService.getCurrentPrimaryColor();

  // User status
  currentStatus: string = 'online';

  // Role-based navigation
  isChatView: boolean = true;

  // UI state
  showUserProfile: boolean = false;

  // Available options
  colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' }
  ];

  availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ];

  ngOnInit(): void {
    // Migrate from old localStorage format first
    this.storageService.migrateFromOldFormat();
    
    try {
      const resolved = this.route.snapshot.data?.['companyConfig'];
      if (resolved && resolved.effective) {
        const kv: Record<string, string> = {};
        (resolved.effective as any[]).forEach((c: any) => { kv[c.cConfiguracionEmpresaClave] = c.cConfiguracionEmpresaValor; });
        this.effectiveConfig = kv as any;
      }
    } catch {}

    this.loadInitialData();
    this.loadUserPreferences();
    // SignalR will be initialized after user data is loaded
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
    this.signalRInitialized = false; // Reset flag for future component instances
    (this.translationService as any).destroy();
  }

  private loadInitialData(): void {
    this.isLoadingConfigurations = true;

    // Load current user first
    this.getCurrentUserUseCase.execute()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingConfigurations = false)
      )
      .subscribe({
        next: (user: ChatUser) => {
          this.currentUser = user;
          this.currentUserId = user.id;
          
          // Get the original authenticated user data to preserve role and other fields
          const authUser = this.authService.getCurrentUserValue();
          
          // Save user to storage service, preserving original data if available
          if (authUser) {
            // Use the original authenticated user data to preserve role and other important fields
            this.storageService.setUser({
              id: authUser.id,
              email: authUser.email,
              name: authUser.name || authUser.username || user.name,
              username: authUser.username || authUser.name || user.name,
              role: authUser.role // Preserve the original role from authentication
            });
          } else {
            // Fallback to ChatUser data if no auth user is available
            this.storageService.setUser({
              id: user.id,
              email: user.email || '',
              name: user.name,
              username: user.name || '', // Use name as username since ChatUser doesn't have username field
              role: user.role || 'user'
            });
          }
          
          console.log('User loaded, initializing SignalR and loading configurations...');
          // Initialize SignalR immediately; do not block on configurations
          this.initializeSignalR();
          // Load conversations regardless of configuration status
          this.loadConversations();
          // Load application and company configurations in background
          this.loadConfigurations().catch(err => {
            console.warn('Configurations failed, continuing without them:', err);
          });
        },
        error: (error: any) => {
          console.error('Error loading current user:', error);
          // Redirect to login if user is not authenticated
          this.router.navigate(['/login']);
        }
      });
  }

  private loadUserPreferences(): void {
    // Load theme preference from theme service
    this.currentTheme = this.themeService.getCurrentTheme();
    this.currentPrimaryColor = this.themeService.getCurrentPrimaryColor();

    // Load preferences from storage service
    const config = this.storageService.getChatConfig();
    
    // Set Spanish as default if no language is configured
    if (!config.language) {
      this.currentLanguage = 'es';
      this.isTranslationEnabled = true; // Enable translation by default for Spanish
      this.storageService.setChatConfig({ 
        language: 'es', 
        translationEnabled: true 
      });
    } else {
      this.currentLanguage = config.language;
      this.isTranslationEnabled = config.translationEnabled;
    }
    
    this.currentStatus = config.userStatus;

    // Initialize translation if enabled (always true for Spanish default)
    (this.translationService as any).setTargetLanguage?.(this.currentLanguage);
    (this.translationService as any).setEnabled?.(this.isTranslationEnabled);
    this.applyTheme(this.currentTheme);
    if (this.isTranslationEnabled) {
      this.initializeTranslation();
    }
  }

  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private applyPrimaryColor(color: string): void {
    document.documentElement.style.setProperty('--primary-color', color);
  }

  private async initializeTranslation(): Promise<void> {
    console.log('[ChatPage] Initializing translation service');
    console.log(`[ChatPage] Current language: ${this.currentLanguage}`);
    console.log(`[ChatPage] Translation enabled: ${this.isTranslationEnabled}`);
    
    try {
      this.translationStatus = 'checking';
      this.translationError = null;

      // Check if translation is supported first
      console.log('[ChatPage] Checking if translation is supported');
      if (!(this.translationService as any).isTranslationSupported()) {
        console.warn('[ChatPage] Translation API not supported in this browser');
        this.isTranslationEnabled = false;
        this.translationStatus = 'not-supported';
        this.translationError = 'Translation is not supported in this browser';
        return;
      }
      console.log('[ChatPage] Translation API is supported');

      // Check availability before initializing
      console.log(`[ChatPage] Checking translation availability for language: ${this.currentLanguage}`);
      
      // Always use English as source since our UI texts are in English
      let availability = 'unavailable';
      const sourceLanguage = 'en';
      
      // Skip availability check if target language is same as source (English)
      if (this.currentLanguage === 'en') {
        console.log(`[ChatPage] Target language is English, same as source - no translation needed`);
        availability = 'available'; // Consider it available since no translation is needed
      } else {
        try {
          availability = await (this.translationService as any).checkAvailability({
            sourceLanguage: sourceLanguage,
            targetLanguage: this.currentLanguage
          });
          console.log(`[ChatPage] Checking availability for ${sourceLanguage} -> ${this.currentLanguage}: ${availability}`);
        } catch (error) {
          console.log(`[ChatPage] Failed to check availability for ${sourceLanguage} -> ${this.currentLanguage}:`, error);
        }
      }
      
      console.log(`[ChatPage] Final translation availability result: ${availability} with source: ${sourceLanguage}`);

      if (availability === 'downloadable') {
        console.log(`[ChatPage] Translation models need to be downloaded for ${this.currentLanguage}`);
        this.translationStatus = 'downloading';
        this.translationError = `Downloading translation models for ${this.currentLanguage}...`;
        
        // Simulate download progress
        this.simulateDownloadProgress();
        
        // Try to download the models
        const downloadSuccess = await (this.translationService as any).downloadTranslationModels({
          sourceLanguage: 'en', // Always use English as source since our UI texts are in English
          targetLanguage: this.currentLanguage
        });
        
        if (downloadSuccess) {
          console.log(`[ChatPage] Translation models downloaded successfully`);
          this.translationDownloadProgress = 100;
          // Models downloaded, now initialize the translator
          // Note: The re-translation will be triggered after translator initialization
        } else {
          console.warn(`[ChatPage] Failed to download translation models`);
          this.isTranslationEnabled = false;
          this.translationStatus = 'download-failed';
          this.translationError = `Failed to download translation models for ${this.currentLanguage}`;
          return;
        }
      } else if (availability !== 'available') {
        console.warn(`[ChatPage] Translation not available for language ${this.currentLanguage}: ${availability}`);
        console.warn(`[ChatPage] No supported translation pair found for target language: ${this.currentLanguage}`);
        this.isTranslationEnabled = false;
        this.translationStatus = 'unavailable';
        this.translationError = `Translation is not available for ${this.currentLanguage}. The browser does not support translation to this language.`;
        return;
      }

      // Initialize the translator
      console.log('[ChatPage] Initializing translator');
      this.translationStatus = 'initializing';
      
      // Skip translator initialization if target language is English (no translation needed)
      let success = true;
      if (this.currentLanguage !== 'en') {
        success = await (this.translationService as any).initializeTranslator({
          sourceLanguage: 'en', // Always use English as source since our UI texts are in English
          targetLanguage: this.currentLanguage
        });
      } else {
        console.log(`[ChatPage] Target language is English, skipping translator initialization`);
      }

      if (!success) {
        console.warn('[ChatPage] Failed to initialize translator');
        this.isTranslationEnabled = false;
        this.translationStatus = 'failed';
        this.translationError = 'Failed to initialize translator';
      } else {
        console.log(`[ChatPage] Translation initialized successfully for ${this.currentLanguage}`);
        this.translationStatus = 'ready';
        this.translationError = null;
        
        // Trigger re-translation of all labels after successful initialization
        console.log('[ChatPage] Triggering re-translation of all labels');
        (this.translationService as any).triggerRetranslation();
      }
    } catch (error) {
      console.error('[ChatPage] Failed to initialize translation:', error);
      this.isTranslationEnabled = false;
      this.translationStatus = 'error';
      this.translationError = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private async loadConfigurations(): Promise<void> {
    try {
      const application = this.authService.getCurrentApplication();
      
      if (!application) {
        console.warn('No application data found, using default configuration');
        return;
      }

      // Save application to storage service
      if (application) {
        this.storageService.setApplication({
          id: application.id || 'default-app',
          code: application.code || 'default',
          name: application.name || 'Default Application'
        });
      }

      console.log('Loading application configuration for:', application.code);
      
      // Load application configuration
      let applicationId = application.id;
      let appConfig$: Observable<ApplicationSettings | null> = of(null);
      
      if (applicationId) {
        // Si tenemos ID, usarlo directamente
        appConfig$ = this.getApplicationConfigUseCase.execute({ applicationId })
          .pipe(catchError(error => { console.error('Error loading application configuration:', error); return of(null); }));
      } else if (application.code) {
        // Si no hay ID pero hay código, primero obtener la aplicación por código
        console.log('Resolving application ID by code:', application.code);
        
        // Obtener la aplicación por código y luego cargar la configuración
        appConfig$ = this.applicationRepository.getByCode(application.code).pipe(
          switchMap(app => {
            if (app && app.id) {
              console.log('Application found by code, ID:', app.id);
              return this.getApplicationConfigUseCase.execute({ applicationId: app.id })
                .pipe(catchError(error => { 
                  console.error('Error loading application configuration:', error); 
                  return of(null); 
                }));
            } else {
              console.warn('Application not found by code:', application.code);
              return of(null);
            }
          }),
          catchError(error => {
            console.error('Error resolving application by code:', error);
            return of(null);
          })
        );
      } else {
        console.warn('No application ID or code available, skipping application configuration');
        appConfig$ = of(null);
      }

      // Load company configuration if user has a company
      let companyConfig$: Observable<CompanyConfiguration | null> = of(null);
      if (this.currentUser?.companyId) {
        console.log('Loading company configuration for:', this.currentUser.companyId);
        companyConfig$ = this.getCompanyConfigUseCase.execute({ 
          companyId: this.currentUser.companyId 
        }).pipe(
          catchError(error => {
            console.error('Error loading company configuration:', error);
            return of(null);
          })
        );
      }

      // Wait for both configurations to load
      const configs = await forkJoin([appConfig$, companyConfig$])
        .pipe(takeUntil(this.destroy$))
        .toPromise() || [null, null];
      
      const appConfig = configs[0] as ApplicationSettings | null;
      const companyConfig = configs[1] as CompanyConfiguration | null;

      this.applicationConfig = appConfig;
      this.companyConfig = companyConfig;

      // Calcular configuración efectiva con precedencia de empresa
      this.effectiveConfig = this.mergeConfigs(this.applicationConfig, this.companyConfig);

      // Aplicar lógica según cModoGestionContactos
      const modoGestion = (this.effectiveConfig as any)?.cModoGestionContactos;
      console.log('Modo de gestión de contactos:', modoGestion);
      
      // Guardar el modo de gestión para uso posterior
      this.storageService.setChatConfig({ modoGestionContactos: modoGestion || 'LOCAL' });
      
      // Configurar la fuente de contactos según el modo
      if (modoGestion === 'API_EXTERNA') {
        // Solo usuarios externos via API
        this.storageService.setChatConfig({ contactSource: 'Usuarios' });
        console.warn('Modo API_EXTERNA: Se usaría API externa, pero endpoint no implementado');
      } else if (modoGestion === 'LOCAL') {
        // Solo contactos locales (ChatContacto)
        this.storageService.setChatConfig({ contactSource: 'ChatContacto' });
        console.log('Modo LOCAL: Usando solo contactos locales');
      } else if (modoGestion === 'HIBRIDO') {
        // Ambos: contactos locales + usuarios externos
        this.storageService.setChatConfig({ contactSource: 'Ambos' });
        console.log('Modo HIBRIDO: Usando contactos locales y usuarios externos');
      } else {
        // Fallback por defecto: contactos locales
        this.storageService.setChatConfig({ contactSource: 'ChatContacto' });
        console.log('Modo no definido, usando contactos locales por defecto');
      }

      console.log('Application configuration loaded:', this.applicationConfig);
      console.log('Company configuration loaded:', this.companyConfig);

      const tipoListadoCfg = (this.effectiveConfig as any)?.tipo_listado_contactos;
      if (tipoListadoCfg) {
        const map: Record<string, string> = { 'todos': '1', 'contactos': '2', 'no_contactos': '3', 'empresa': '1', 'global': '1', 'aplicacion': '1' };
        const val = map[(tipoListadoCfg || '').toString().toLowerCase()] || tipoListadoCfg;
        this.storageService.setChatConfig({ tipoListadoContactos: val.toString() });
      }

      // Apply configuration-based logic here if needed
      this.applyConfigurations();
      
      // Prefetch datos dependientes de configuración
      this.prefetchInitData();

    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  }

  private prefetchInitData(): void {
    const tasks: Observable<any>[] = [];

    // Mis contactos aceptados
    tasks.push(
      this.chatApiService.getMyContacts('accepted').pipe(catchError(() => of([])))
    );

    // Solicitudes pendientes si la configuración requiere aprobación de contacto
    const rawAprob = String(((this.effectiveConfig as any) || {})['bRequiereAprobacion'] ?? '').toLowerCase();
    const requiereAprobacion = rawAprob === 'true' || rawAprob === '1';
    if (requiereAprobacion) {
      tasks.push(this.chatApiService.getPendingContactRequests().pipe(catchError(() => of([]))));
    } else {
      tasks.push(of([]));
    }

    // Sugerencias iniciales desactivadas para evitar llamadas vacías al endpoint de búsqueda

    forkJoin(tasks)
      .pipe(takeUntil(this.destroy$))
      .subscribe(([myContacts, pendingRequests]) => {
        try {
          // Procesar contactos aceptados
          if (myContacts && myContacts.length > 0) {
            this.availableContacts = myContacts;
            this.filteredContacts = myContacts;
          }
          // Fallback a mock si no hay datos
          if (this.USE_MOCK_CONTACTS && (!this.availableContacts || this.availableContacts.length === 0)) {
            console.log('[ChatPage] Using MOCK_CONTACTS fallback');
            this.availableContacts = this.MOCK_CONTACTS;
            this.filteredContacts = this.MOCK_CONTACTS;
          }
        } catch {}
        try {
          this.pendingContactRequests = pendingRequests || [];
        } catch {}
      });
  }

  private applyConfigurations(): void {
    // Apply any configuration-based logic here
    // For example:
    // - Filter conversations based on company settings
    // - Apply application-specific features
    // - Set up custom branding or themes
    
    if (!this.effectiveConfig) return;

    if (this.effectiveConfig.enableGroupChat === false) {
      console.log('Group chat disabled by effective configuration');
    }

    if (this.effectiveConfig.enableFileSharing === false) {
      console.log('File sharing disabled by effective configuration');
    }
  }


  private mergeConfigs(app: ApplicationSettings | null, company: CompanyConfiguration | null): Partial<ApplicationSettings & CompanyConfiguration> {
    const result: any = {};

    const pickFirstDefined = (companyVal: any, appVal: any) => {
      return companyVal !== undefined && companyVal !== null ? companyVal : appVal;
    };

    // Branding
    result.primaryColor = pickFirstDefined(company?.primaryColor, app?.primaryColor);
    result.secondaryColor = pickFirstDefined(company?.secondaryColor, app?.secondaryColor);
    result.logoUrl = pickFirstDefined(company?.logoUrl, app?.logoUrl);

    // Features (AND para restricciones)
    const featureAnd = (a: boolean | undefined, b: boolean | undefined, def: boolean = true) => {
      const va = a === undefined ? def : a;
      const vb = b === undefined ? def : b;
      return va && vb;
    };
    result.enableFileSharing = featureAnd(company?.enableFileSharing, app?.enableFileSharing);
    result.enableScreenSharing = pickFirstDefined(company?.enableScreenSharing, undefined);
    result.enableVoiceMessages = pickFirstDefined(company?.enableVoiceMessages, undefined);
    result.enableVideoCall = pickFirstDefined(company?.enableVideoCall, undefined);
    result.enableGroupChat = pickFirstDefined(company?.enableGroupChat, true);
    result.enableAnalytics = featureAnd(undefined, app?.enableAnalytics);
    result.enableNotifications = featureAnd(undefined, app?.enableNotifications);

    // Límites y seguridad (más restrictivo cuando aplique)
    const minDefined = (a?: number, b?: number) => {
      const nums = [a, b].filter(v => v !== undefined && v !== null) as number[];
      if (nums.length === 0) return undefined;
      return Math.min(...nums);
    };
    result.maxMessageLength = minDefined(company?.maxMessageLength, undefined);
    result.maxUsersPerChannel = minDefined(company?.maxUsersPerChannel, undefined);
    result.maxRequestsPerMinute = minDefined(undefined, app?.maxRequestsPerMinute);
    result.maxConcurrentConnections = minDefined(undefined, app?.maxConcurrentConnections);
    result.sessionTimeoutMinutes = minDefined(company?.sessionTimeoutMinutes, app?.sessionTimeoutMinutes);

    // Archivos (solo configuración de aplicación)
    result.allowedFileTypes = app?.allowedFileTypes;
    result.maxFileSize = app?.maxFileSize;

    // Otros de aplicación
    result.enableTwoFactor = pickFirstDefined(company?.requireTwoFactor, app?.enableTwoFactor);
    result.passwordMinLength = pickFirstDefined(undefined, app?.passwordMinLength);
    result.enableSocialLogin = pickFirstDefined(undefined, app?.enableSocialLogin);
    result.enableGuestAccess = pickFirstDefined(undefined, app?.enableGuestAccess);
    result.customFont = pickFirstDefined(undefined, app?.customFont);

    return result;
  }

  private initializeSignalR(): void {
    // Check if we have authentication data before starting SignalR
    const token = this.storageService.getAuthToken() || sessionStorage.getItem('auth_token');
    const user = this.storageService.getUser() || JSON.parse(sessionStorage.getItem('user') || 'null');
    const application = this.storageService.getApplication() || JSON.parse(sessionStorage.getItem('application') || 'null');
    
    if (!token || !user || !application) {
      console.warn('Cannot initialize SignalR: missing authentication data');
      console.log('Token:', token ? 'EXISTS' : 'MISSING');
      console.log('User:', user ? 'EXISTS' : 'MISSING');
      console.log('Application:', application ? 'EXISTS' : 'MISSING');
      return;
    }
    
    // Check if SignalR is already initialized to prevent multiple connections
    if (this.signalRInitialized) {
      console.log('SignalR already initialized, skipping...');
      return;
    }
    
    const connectionState = this.signalRService.getConnectionState();
    if (this.isConnected || connectionState === 'connecting' || connectionState === 'connected') {
      console.log('SignalR already connected or connecting, skipping...');
      console.log('Current connection state:', connectionState);
      console.log('Is connected:', this.isConnected);
      this.signalRInitialized = true; // Mark as initialized to prevent future attempts
      return;
    }
    
    console.log('Authentication data available, initializing SignalR...');
    console.log('Current connection state before initialization:', connectionState);
    
    // Mark as initialized BEFORE starting to prevent race conditions
    this.signalRInitialized = true;
    
    // Start SignalR connection
    this.signalRService.startConnection().then(() => {
      console.log('SignalR connection established successfully');
    }).catch(error => {
      console.error('Failed to establish SignalR connection:', error);
      // Reset the flag on failure so it can be retried later
      this.signalRInitialized = false;
    });

    // Subscribe to connection state
    this.signalRService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        console.log('SignalR connection state changed:', state);
        this.isConnected = state === 'connected';
      });

    // Subscribe to new messages
    this.signalRService.messageReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.handleNewMessage(message);
      });

    // Subscribe to message delivery confirmations
    this.signalRService.messageDelivered$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ messageId, deliveredAt }) => {
        this.updateMessageStatus(messageId, 'delivered', deliveredAt);
      });

    // Subscribe to message read confirmations
    this.signalRService.messageRead$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ messageId, readAt }) => {
        this.updateMessageStatus(messageId, 'read', readAt);
      });

    // Subscribe to user online status
    this.signalRService.userOnline$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId, isOnline }) => {
        this.updateUserOnlineStatus(userId.toString(), isOnline);
      });

    // Subscribe to typing indicators
    this.signalRService.userTyping$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ userId, conversationId, isTyping, userName }) => {
        this.handleTypingIndicator(conversationId.toString(), userId.toString(), isTyping, userName);
      });

    // Subscribe to conversation updates
    this.signalRService.conversationUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ conversationId }) => {
        this.updateConversationActivity(conversationId.toString());
      });

    this.signalRService.conversationCreated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversation) => {
        const exists = this.conversations.some(c => c.id.toString() === conversation.id.toString());
        if (!exists) {
          this.conversations = [conversation, ...this.conversations];
          this.displayedConversations = [conversation, ...this.displayedConversations];
        } else {
          this.conversations = this.conversations.map(c => c.id.toString() === conversation.id.toString() ? { ...c, name: conversation.name } : c);
          this.displayedConversations = this.displayedConversations.map(c => c.id.toString() === conversation.id.toString() ? { ...c, name: conversation.name } : c);
        }
      });

    // Subscribe to conversation membership events
    this.signalRService.conversationJoined$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ conversationId }) => {
        console.log('Conversation joined ack:', conversationId);
        if (this.selectedConversationId === conversationId.toString()) {
          // Optionally update UI state to online for conversation
          this.currentStatus = 'online';
        }
      });

    this.signalRService.conversationMemberJoined$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ conversationId, userId }) => {
        console.log('Member joined conversation:', conversationId, userId);
        // If the other participant joined, mark them online
        const conv = this.conversations.find(c => c.id.toString() === (conversationId || '').toString());
        if (conv && conv.participants) {
          conv.participants = conv.participants.map(p => p.id === userId ? { ...p, isOnline: true } : p);
        }
      });
  }

  private loadConversations(): void {
    this.getConversationsUseCase.execute()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations: Conversation[]) => {
          this.conversations = conversations;
          this.displayedConversations = conversations;
          // Hydrate participants and names when missing
          this.hydrateParticipantsForConversations();
        },
        error: (error: any) => {
          console.error('Error loading conversations:', error);
        }
      });
  }

  private loadMessages(conversationId: string): void {
    this.isLoadingMessages = true;
    this.messages = [];

    const useSignalR = this.signalRService.getConnectionState() === 'connected';
    if (useSignalR) {
      (async () => {
        try {
          const messages = await this.signalRService.getConversationMessages(conversationId, 1, 50);
          await this.applyLoadedMessages(conversationId, messages);
        } catch (error) {
          console.warn('Fallo al cargar mensajes vía SignalR, fallback a HTTP:', error);
          this.loadMessagesViaHttp(conversationId);
        } finally {
          this.isLoadingMessages = false;
        }
      })();
      return;
    }

    this.getMessagesUseCase.execute({ conversationId: conversationId })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingMessages = false)
      )
      .subscribe({
        next: async (messages: ChatMessage[]) => {
          await this.applyLoadedMessages(conversationId, messages);
        },
        error: (error: any) => {
          console.error('Error loading messages:', error);
        }
      });
  }

  private loadMessagesViaHttp(conversationId: string): void {
    this.getMessagesUseCase.execute({ conversationId: conversationId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (messages: ChatMessage[]) => {
          await this.applyLoadedMessages(conversationId, messages);
        },
        error: (error: any) => {
          console.error('Error loading messages (HTTP fallback):', error);
        }
      });
  }

  private async applyLoadedMessages(conversationId: string, messages: ChatMessage[]): Promise<void> {
          console.log(`[ChatPage] Loading ${messages.length} messages`);
          console.log(`[ChatPage] Translation enabled: ${this.isTranslationEnabled}`);
          console.log(`[ChatPage] Current language: ${this.currentLanguage}`);
          
          // Translate messages if translation is enabled
          if (this.isTranslationEnabled) {
            console.log('[ChatPage] Starting message translation process');
            const translatedMessages = await Promise.all(
              messages.map(async (message) => {
                console.log(`[ChatPage] Processing message from ${message.senderId}, current user: ${this.currentUserId}, type: ${message.type}`);
                
                if (message.senderId !== this.currentUserId && message.type === 'text') {
                  console.log(`[ChatPage] Translating message: "${message.content}"`);
                  try {
                    const translatedContent = await (this.translationService as any).translateMessage(
                      message.content,
                      this.currentLanguage
                    );
                    console.log(`[ChatPage] Translation result: "${translatedContent}"`);
                    
                    if (translatedContent && translatedContent !== message.content) {
                      console.log('[ChatPage] Translation successful, different from original');
                      return { 
                        ...message, 
                        content: translatedContent,
                        originalContent: message.content
                      };
                    } else {
                      console.log('[ChatPage] Translation result same as original or empty');
                    }
                  } catch (error) {
                    console.warn('[ChatPage] Failed to translate message:', error);
                  }
                } else {
                  console.log('[ChatPage] Message skipped for translation (same user or not text)');
                }
                return message;
              })
            );
            console.log('[ChatPage] Translation process completed');
            this.messages = translatedMessages;
          } else {
            console.log('[ChatPage] Translation disabled, using original messages');
            this.messages = messages;
          }
          // Update header user/name if participants are missing
          if ((!this.selectedUser || !this.selectedUser.id) && (!this.conversations.find(c => c.id === conversationId)?.participants?.length)) {
            const otherMsg = (this.messages || []).find(m => m.senderId !== this.currentUserId);
            if (otherMsg) {
              const inferred: ChatUser = { id: otherMsg.senderId, name: otherMsg.senderName || (this.selectedUser?.name || 'Usuario'), email: '', role: 'user', isActive: true, isOnline: false };
              this.selectedUser = inferred;
              this.refreshDisplayedConversations();
            }
          }
          this.hasMoreMessages = messages.length >= 50; // Assume page size of 50
  }

  // SignalR event handlers
  private async handleNewMessage(message: ChatMessage): Promise<void> {
    console.log(`[ChatPage] handleNewMessage called for message from ${message.senderId}, current user: ${this.currentUserId}`);
    console.log(`[ChatPage] Message content: "${message.content}", type: ${message.type}`);
    console.log(`[ChatPage] Translation enabled: ${this.isTranslationEnabled}`);
    
    // Translate message if translation is enabled and it's not from current user
    if (this.isTranslationEnabled && message.senderId !== this.currentUserId && message.type === 'text') {
      console.log('[ChatPage] Translating new message');
      try {
        const translatedContent = await (this.translationService as any).translateMessage(
          message.content,
          this.currentLanguage
        );
        console.log(`[ChatPage] New message translation result: "${translatedContent}"`);
        if (translatedContent && translatedContent !== message.content) {
          console.log('[ChatPage] Translation successful, updating message');
          message = { 
            ...message, 
            content: translatedContent,
            originalContent: message.content // Store original for reference
          };
        }
      } catch (error) {
        console.warn('Failed to translate message:', error);
      }
    }

    // Add message to the current conversation if it matches
    if (this.selectedConversationId && message.conversationId === this.selectedConversationId) {
      this.messages = [...this.messages, message];
    }

    // Update conversation's last message
    const conversation = this.conversations.find(c => c.id === message.conversationId);
    if (conversation) {
      const updated: Conversation = { ...conversation, lastMessage: message };
      // Move conversation to top with new reference to trigger CD
      this.conversations = [
        updated,
        ...this.conversations.filter(c => c.id !== updated.id)
      ];
      // Reflect changes into displayed list respecting search state
      this.refreshDisplayedConversations();
    }
  }

  private updateMessageStatus(messageId: string, status: 'delivered' | 'read', timestamp: Date): void {
    this.messages = this.messages.map(message => 
      message.id === messageId 
        ? { ...message, isRead: status === 'read' }
        : message
    );
  }

  private updateUserOnlineStatus(userId: string, isOnline: boolean): void {
    // Update selected user if it matches
    if (this.selectedUser && this.selectedUser.id === userId) {
      this.selectedUser = { ...this.selectedUser, isOnline };
    }

    // Update conversations list
    this.conversations = this.conversations.map(conversation => {
      // Check if any participant matches the userId
      const participantIndex = conversation.participants?.findIndex(p => p.id === userId);
      if (participantIndex !== undefined && participantIndex >= 0) {
        const updatedParticipants = [...(conversation.participants || [])];
        updatedParticipants[participantIndex] = { ...updatedParticipants[participantIndex], isOnline };
        return { ...conversation, participants: updatedParticipants };
      }
      return conversation;
    });
    this.refreshDisplayedConversations();
  }

  private handleTypingIndicator(conversationId: string, userId: string, isTyping: boolean, userName?: string): void {
    if (this.selectedConversationId && this.selectedConversationId.toString() === conversationId) {
      if (isTyping && userId !== this.currentUserId) {
        const conversation = this.conversations.find(c => c.id.toString() === conversationId);
        const user = conversation?.participants?.find(p => p.id === userId);
        if (user) {
          this.typingUsers = [user];
        } else if (userName) {
          this.typingUsers = [{ id: userId, name: userName, email: '', role: 'user', isActive: true, isOnline: true }];
        }
      } else {
        this.typingUsers = [];
      }
    }
  }

  private updateConversationActivity(conversationId: string): void {
    const conversation = this.conversations.find(c => c.id.toString() === conversationId);
    if (conversation) {
      // Move to top of list
      this.conversations = [
        conversation,
        ...this.conversations.filter(c => c.id.toString() !== conversationId)
      ];
      this.refreshDisplayedConversations();
    }
  }

  // Event handlers
  onConversationSelect(conversation: Conversation): void {
    // Leave previous conversation
    if (this.selectedConversationId) {
      this.signalRService.leaveConversation(this.selectedConversationId);
    }

    this.selectedConversationId = conversation.id;
    this.selectedUser = conversation.participants?.find(p => p.id !== this.currentUserId) 
      || conversation.participants?.[0] 
      || null;
    this.loadMessages(conversation.id);

    // Join new conversation
    this.signalRService.joinConversation(conversation.id);

    if (!this.selectedUser || !conversation.participants || conversation.participants.length === 0) {
      const displayName = (conversation as any).displayName || (conversation as any).cdisplayname || (conversation.participants || []).find(p => p.id !== this.currentUserId)?.name || (conversation.lastMessage?.senderName || '') || conversation.name || 'Usuario';
      const placeholderUser: ChatUser = {
        id: '',
        name: displayName || 'Usuario',
        email: '',
        role: 'user',
        isActive: true,
        isOnline: false
      };
      this.selectedUser = placeholderUser;
      // Try hydration for this conversation specifically
      this.hydrateParticipantsForConversation(conversation.id);
    }
  }

  private hydrateParticipantsForConversations(): void {
    (this.conversations || []).forEach(c => {
      if (!c.participants || c.participants.length === 0 || !c.name) {
        this.hydrateParticipantsForConversation(c.id);
      }
    });
  }

  private hydrateParticipantsForConversation(conversationId: string): void {
    // Use ChatApiService directly to avoid circular DI in use case
    this.chatApiService.getConversationParticipants(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(participantsEntities => {
        if (!participantsEntities || participantsEntities.length === 0) return;
        const participants = participantsEntities.map(p => ({
          id: ((p as any).cUsuariosChatId || (p as any).cusuarioschatid || (p as any).cParticipantesChatUsuarioId || (p as any).cparticipanteschatuserid || '').toString(),
          name: (p as any).cUsuariosChatNombre || (p as any).cusuarioschatname || (p as any).nombre || (p as any).displayName || (p as any).cdisplayname || 'Usuario',
          email: (p as any).cUsuariosChatEmail || (p as any).cusuarioschatmail || '',
          avatar: (p as any).cUsuariosChatAvatar || (p as any).cusuarioschatavatar || '',
          role: (p as any).cUsuariosChatRol || (p as any).cparticipanteschatrol || 'user',
          isActive: (p as any).bUsuariosChatEstaActivo ?? (p as any).bparticipanteschatisactive ?? true,
          isOnline: (p as any).bUsuariosChatEstaEnLinea ?? (p as any).bisonline ?? false
        }));
        this.conversations = (this.conversations || []).map(c => {
          if (c.id === conversationId) {
            const isPrivate = c.type === 'private' || (participants.length <= 2);
            const other = participants.find(p => p.id !== this.currentUserId) || participants[0];
            const name = c.name && c.name.trim() ? c.name : (isPrivate ? ((other?.name || (c as any).displayName || (c as any).cdisplayname || c.name || 'Usuario')) : c.name);
            return { ...c, participants, name };
          }
          return c;
        });
        // Update selected user when current conversation is affected
        if (this.selectedConversationId === conversationId) {
          const conv = this.conversations.find(c => c.id === conversationId);
          if (conv) {
            this.selectedUser = conv.participants?.find(p => p.id !== this.currentUserId) || conv.participants?.[0] || this.selectedUser;
          }
        }
        this.refreshDisplayedConversations();
      });
  }

  private refreshDisplayedConversations(): void {
    if (this.isSearchMode) {
      return; // In search mode the sidebar shows contacts
    }
    const query = (this.conversationSearchQuery || '').trim();
    if (!query) {
      this.displayedConversations = this.conversations;
      return;
    }
    const term = query.toLowerCase();
    this.displayedConversations = (this.conversations || []).filter(c => {
      const name = (c.name || '').toLowerCase();
      const last = (c.lastMessage?.content || '').toLowerCase();
      const participants = (c.participants || []).map(p => (p.name || '').toLowerCase());
      return name.includes(term) || last.includes(term) || participants.some(n => n.includes(term));
    });
  }

  async onSendMessage(content: string): Promise<void> {
    if (!this.selectedConversationId || !content.trim()) return;

    const maxLen = (this.effectiveConfig as any)?.maxMessageLength;
    if (typeof maxLen === 'number' && content.length > maxLen) {
      console.warn('Message blocked: exceeds max length');
      return;
    }

    const rpm = (this.effectiveConfig as any)?.maxRequestsPerMinute;
    if (typeof rpm === 'number' && rpm > 0) {
      const now = Date.now();
      const windowMs = 60_000;
      this.messageSentTimestamps = this.messageSentTimestamps.filter(t => now - t < windowMs);
      if (this.messageSentTimestamps.length >= rpm) {
        console.warn('Message blocked: rate limit exceeded');
        return;
      }
      this.messageSentTimestamps.push(now);
    }

    this.isSendingMessage = true;
    try {
      const isSrConnected = this.signalRService.getConnectionState() === 'connected';
      if (isSrConnected) {
        const msg = await this.signalRService.sendMessage(this.selectedConversationId, content.trim(), 'TEXT');
        this.messages = [...this.messages, msg];
      } else {
        this.sendMessageUseCase.execute({ conversationId: this.selectedConversationId, content: content.trim(), type: 'text' })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (message: ChatMessage) => {
              this.messages = [...this.messages, message];
            },
            error: (error: any) => {
              console.error('Error sending message:', error);
            }
          });
      }
    } catch (err) {
      // Fallback automático a HTTP si falla SignalR
      this.sendMessageUseCase.execute({ conversationId: this.selectedConversationId, content: content.trim(), type: 'text' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (message: ChatMessage) => {
            this.messages = [...this.messages, message];
          },
          error: (error: any) => {
            console.error('Error sending message:', error);
          }
        });
    } finally {
      this.isSendingMessage = false;
    }
  }

  onNewChat(): void {
    console.log('Opening contact selection');
    const useModal = (this.effectiveConfig as any)?.newConversationUI === 'modal';
    if (useModal) {
      this.showContactModal = true;
      this.loadAvailableContacts();
      return;
    }
    this.isSearchMode = true;
    this.contactSearchTerm = '';
    this.loadAvailableContacts();
  }

  loadAvailableContacts(): void {
    this.isLoadingContacts = true;
    // Use mock contacts when enabled
    if (this.USE_MOCK_CONTACTS) {
      console.log('[ChatPage] Loading contacts from MOCK_CONTACTS');
      this.availableContacts = this.MOCK_CONTACTS;
      this.filteredContacts = this.MOCK_CONTACTS;
      this.isLoadingContacts = false;
      return;
    }
    
    // No llamar al backend sin término: mostrar hint y esperar input del usuario
    this.availableContacts = [];
    this.filteredContacts = [];
    this.isLoadingContacts = false;
    console.log('[ChatPage] Waiting for user input to search contacts');
  }

  searchContacts(): void {
    const searchTerm = this.contactSearchTerm.trim();
    
    if (!searchTerm) {
      // When using mock, simply reset to full mock list
      if (this.USE_MOCK_CONTACTS) {
        this.filteredContacts = this.MOCK_CONTACTS;
        return;
      }
      // No llamar al backend sin término
      this.filteredContacts = [];
      this.isLoadingContacts = false;
      return;
    }

    this.isLoadingContacts = true;
    // Local filtering when using mock data
    if (this.USE_MOCK_CONTACTS) {
      const term = searchTerm.toLowerCase();
      this.filteredContacts = this.MOCK_CONTACTS.filter(c => 
        (c.name || '').toLowerCase().includes(term) ||
        (c.email || '').toLowerCase().includes(term) ||
        (c.companyName || '').toLowerCase().includes(term)
      );
      this.isLoadingContacts = false;
      return;
    }
    
    // Evitar llamadas para términos muy cortos
    if (searchTerm.length < 2) {
      this.isLoadingContacts = false;
      this.filteredContacts = [];
      return;
    }

    this.searchContactsUseCase.execute(searchTerm)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error searching contacts:', error);
          this.isLoadingContacts = false;
          return of([]);
        })
      )
      .subscribe(contacts => {
        this.filteredContacts = contacts;
        this.isLoadingContacts = false;
      });
  }

  onContactSearchInput(): void {
    // Debounce the search to avoid too many API calls
    clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => {
      this.searchContacts();
    }, 300);
  }

  selectContact(contact: ChatUser): void {
    console.log('Selected contact:', contact);
    this.pendingSelectedContact = contact;
    this.pendingConversationName = contact.name || '';
  }

  exitSearchMode(): void {
    this.isSearchMode = false;
    this.filteredContacts = [];
    this.availableContacts = [];
    this.contactSearchTerm = '';
    this.isLoadingContacts = false;
    this.displayedConversations = this.conversations;
  }

  createConversationWithContact(contact: ChatUser): void {
    if (!this.currentUserId) {
      console.error('Cannot create conversation: current user not loaded');
      return;
    }

    const expectedName = `${this.pendingConversationName || contact.name || ''}`;
    const conversationData = {
      participants: [this.currentUserId, contact.id],
      name: expectedName
    };

    const requiereSolicitud = (this.effectiveConfig as any)?.requiere_solicitud_contacto === true;
    const permiteDirecto = (this.effectiveConfig as any)?.permite_chat_directo !== false;

    const tryCreate = () => {
      console.log('Creating conversation with data:', conversationData);
      this.creatingConversation = true;
      this.creationError = null;
      this.createConversationUseCase.execute(conversationData)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error creating conversation:', error);
          this.creationError = 'No se pudo crear la conversación';
          this.creatingConversation = false;
          return of(null);
        })
      )
      .subscribe(conversation => {
        if (conversation) {
          console.log('Conversation created successfully:', conversation);
          this.closeContactModal();
          this.exitSearchMode();
          this.pendingSelectedContact = null;
          this.pendingConversationName = '';
          this.creatingConversation = false;
          
          const createdId = conversation.id;
          const isValidId = !!createdId && createdId !== '0';

          if (isValidId) {
            this.conversations.unshift(conversation);
            this.displayedConversations = this.conversations;
            this.selectedConversationId = createdId;
            this.selectedUser = conversation.participants.find(p => p.id !== this.currentUserId) || contact || null;
            this.loadMessages(createdId);
          }

          this.loadConversations();

          setTimeout(() => {
            const found = this.conversations.find(c => (c.name || '').toLowerCase() === expectedName.toLowerCase());
            if (found?.id && found.id !== '0') {
              this.selectedConversationId = found.id;
              this.selectedUser = found.participants?.find(p => p.id !== this.currentUserId) || contact || null;
              this.loadMessages(found.id);
            }
          }, 500);
        } else {
          console.error('Failed to create conversation');
          this.creatingConversation = false;
        }
      });
    };

    if (!permiteDirecto || requiereSolicitud) {
      this.chatApiService.verifyChatPermission(contact.id)
        .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            console.warn('verifyChatPermission error, falling back to send request:', err);
            return of({ isAllowed: false });
          })
        )
        .subscribe(result => {
          const allowed = (result as any)?.resultado ?? (result as any)?.isAllowed ?? false;
          if (allowed) {
            tryCreate();
          } else {
            this.chatApiService.sendContactRequestContacto(contact.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => {
                console.log('Contact request sent');
                this.closeContactModal();
              });
          }
        });
      return;
    }

    tryCreate();
  }

  confirmCreateConversation(): void {
    if (this.pendingSelectedContact) {
      this.createConversationWithContact(this.pendingSelectedContact);
    }
  }

  cancelCreateConversation(): void {
    this.pendingSelectedContact = null;
    this.pendingConversationName = '';
    this.creationError = null;
  }

  closeContactModal(): void {
    this.showContactModal = false;
    this.contactSearchTerm = '';
    this.filteredContacts = [];
    this.availableContacts = [];
    this.isSearchMode = false;
  }

  onSettings(): void {
    this.router.navigate(['/configuration']);
  }

  // Translation handlers
  onTranslationToggle(enabled: boolean): void {
    console.log(`[ChatPage] Translation toggle changed to: ${enabled}`);
    this.isTranslationEnabled = enabled;
    this.storageService.setChatConfig({ translationEnabled: enabled });
    (this.translationService as any).setEnabled?.(enabled);
    
    if (enabled) {
      console.log('[ChatPage] Translation enabled, initializing translation service');
      this.initializeTranslation();
    } else {
      console.log('[ChatPage] Translation disabled, destroying translation service');
      (this.translationService as any).destroy();
      this.translationStatus = 'not-initialized';
      this.translationError = null;
      (this.translationService as any).triggerRetranslation?.();
    }
  }

  async testTranslation(): Promise<void> {
    console.log('[ChatPage] Test translation button clicked');
    console.log(`[ChatPage] Current translation status: ${this.translationStatus}`);
    console.log(`[ChatPage] Translation enabled: ${this.isTranslationEnabled}`);
    console.log(`[ChatPage] Current language: ${this.currentLanguage}`);
    
    if (!this.isTranslationEnabled) {
      console.warn('[ChatPage] Translation is disabled, enabling it first');
      this.onTranslationToggle(true);
      return;
    }
    
    if (this.translationStatus !== 'ready') {
      console.warn(`[ChatPage] Translation not ready, current status: ${this.translationStatus}`);
      return;
    }
    
    const testText = 'Hello, this is a test message for translation';
    console.log(`[ChatPage] Testing translation with text: "${testText}"`);
    
    try {
      const translated = await (this.translationService as any).translateMessage(testText, this.currentLanguage);
      console.log(`[ChatPage] Test translation result: "${translated}"`);
      
      if (translated && translated !== testText) {
        console.log('[ChatPage] Translation test successful!');
      } else {
        console.log('[ChatPage] Translation test failed - result same as original');
      }
    } catch (error) {
      console.error('[ChatPage] Translation test failed with error:', error);
    }
  }

  onLanguageChange(event: Event | string): void {
    console.log(`[ChatPage] Language change triggered:`, event);
    let language: string;
    
    if (typeof event === 'string') {
      language = event;
    } else {
      const selectElement = event.target as HTMLSelectElement;
      language = selectElement.value;
    }
    
    console.log(`[ChatPage] Changing language to: ${language}`);
    this.currentLanguage = language;
    
    // Automatically disable translation for English, enable for other languages
    const shouldTranslate = language !== 'en';
    this.isTranslationEnabled = shouldTranslate;
    (this.translationService as any).setTargetLanguage?.(language);
    (this.translationService as any).setEnabled?.(shouldTranslate);
    
    this.storageService.setChatConfig({ 
      language: language,
      translationEnabled: shouldTranslate 
    });
    
    if (shouldTranslate) {
      console.log('[ChatPage] Translation will be enabled, reinitializing translation service');
      this.initializeTranslation();
    } else {
      console.log('[ChatPage] Translation disabled for English, showing original text');
      // When English is selected, we don't want any translation
      // Destroy the translator and reset status
      (this.translationService as any).destroy();
      this.translationStatus = 'disabled';
      this.translationError = null;
      // Force refresh of all translated labels by triggering a re-translation event
      // but since translation is disabled, they'll show original English
      (this.translationService as any).triggerRetranslation();
    }
    
    this.showUserProfile = false;
  }

  // Theme handlers
  onThemeChange(theme: string): void {
    this.themeService.setTheme(theme as 'light' | 'dark');
    this.currentTheme = theme;
    this.applyTheme(theme);
  }

  onPrimaryColorChange(color: string): void {
    this.themeService.setPrimaryColor(color);
    this.currentPrimaryColor = color;
  }

  // User status handlers
  onStatusChange(status: string): void {
    this.currentStatus = status;
    this.storageService.setChatConfig({ userStatus: status });
  }

  onUserLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, navigate to login and clear local data
        this.router.navigate(['/login']);
      }
    });
  }

  navigateToChat(): void {
    this.isChatView = true;
    // Already in chat view, no navigation needed
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  onSearchConversations(query: string): void {
    // When in search mode, use contacts search to replace sidebar list
    if (this.isSearchMode) {
      this.contactSearchTerm = query || '';
      this.onContactSearchInput();
      return;
    }
    this.conversationSearchQuery = (query || '').trim();
    if (!this.conversationSearchQuery) {
      this.displayedConversations = this.conversations;
      return;
    }
    const term = this.conversationSearchQuery.toLowerCase();
    this.displayedConversations = (this.conversations || []).filter(c => {
      const name = (c.name || '').toLowerCase();
      const last = (c.lastMessage?.content || '').toLowerCase();
      const participants = (c.participants || []).map(p => (p.name || '').toLowerCase());
      return name.includes(term) || last.includes(term) || participants.some(n => n.includes(term));
    });
  }

  onLoadOlderMessages(): void {
    if (!this.selectedConversationId || this.isLoadingOlderMessages) return;
    
    this.isLoadingOlderMessages = true;
    // TODO: Implement pagination for older messages
    console.log('Load older messages');
    this.isLoadingOlderMessages = false;
  }

  onAttachmentClick(): void {
    if (this.effectiveConfig && this.effectiveConfig.enableFileSharing === false) {
      console.log('File attachment blocked by effective configuration');
      return;
    }
    console.log('Attachment clicked');
  }

  onAttachmentSelected(file: File): void {
    if (!this.selectedConversationId) return;
    if (this.effectiveConfig && this.effectiveConfig.enableFileSharing === false) return;
    const allowed = (this.effectiveConfig as any)?.allowedFileTypes as string[] | undefined;
    const maxFileSize = (this.effectiveConfig as any)?.maxFileSize as number | undefined;
    if (!this.validationService.isTypeAllowed(file, allowed)) {
      console.warn('Archivo bloqueado: tipo no permitido por configuración');
      this.showTranslatedError('Tipo de archivo no permitido por configuración');
      return;
    }
    if (!this.validationService.isSizeAllowed(file, maxFileSize)) {
      console.warn('Archivo bloqueado: excede tamaño máximo permitido');
      this.showTranslatedError('El archivo excede el tamaño máximo permitido');
      return;
    }
    const mime = (file.type || '').toLowerCase();
    const isImage = mime.startsWith('image/');
    const isAudio = mime.startsWith('audio/');
    const isVideo = mime.startsWith('video/');
    const type: 'image' | 'audio' | 'video' | 'file' = isImage ? 'image' : (isAudio ? 'audio' : (isVideo ? 'video' : 'file'));
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const previewUrl = URL.createObjectURL(file);
    this.pendingAttachments = [
      ...this.pendingAttachments,
      { id, file, type, previewUrl, uploadProgress: null }
    ];
    this.pendingAttachmentFile = null;
    this.uploadProgress = null;
  }

  clearPendingAttachment(): void {
    this.pendingAttachmentFile = null;
    this.uploadProgress = null;
  }

  removePendingAttachment(id: string): void {
    const item = this.pendingAttachments.find(a => a.id === id);
    if (item) {
      try { URL.revokeObjectURL(item.previewUrl); } catch {}
    }
    this.pendingAttachments = this.pendingAttachments.filter(a => a.id !== id);
  }

  sendPendingAttachment(): void {
    // Backward compatibility: if using legacy single file panel
    if (this.pendingAttachmentFile) {
      const tempId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const mime = (this.pendingAttachmentFile.type || '').toLowerCase();
      const isImage = mime.startsWith('image/');
      const isAudio = mime.startsWith('audio/');
      const isVideo = mime.startsWith('video/');
      const type: 'image' | 'audio' | 'video' | 'file' = isImage ? 'image' : (isAudio ? 'audio' : (isVideo ? 'video' : 'file'));
      const previewUrl = URL.createObjectURL(this.pendingAttachmentFile);
      this.pendingAttachments = [
        ...this.pendingAttachments,
        { id: tempId, file: this.pendingAttachmentFile, type, previewUrl, uploadProgress: null }
      ];
      this.pendingAttachmentFile = null;
    }
    // Send all pending attachments sequentially
    const conversationId = this.selectedConversationId;
    if (!conversationId) return;
    const items = [...this.pendingAttachments];
    const sendNext = () => {
      const item = items.shift();
      if (!item) return;
      this.isSendingMessage = true;
      const tempId = `local-${item.id}`;
      const tempType: 'image' | 'audio' | 'file' | 'video' = item.type;
      const tempMessage: ChatMessage = {
        id: tempId,
        conversationId,
        senderId: this.currentUserId || '',
        senderName: this.currentUser?.name || 'Yo',
        content: item.previewUrl,
        originalContent: item.previewUrl,
        type: tempType === 'video' ? 'file' : tempType,
        timestamp: new Date(),
        isRead: true,
        state: 'uploading',
        uploadProgress: 0,
        localPreviewUrl: item.previewUrl
      };
      this.messages = [...this.messages, tempMessage];
      this.chatApiService.uploadAttachmentWithProgress(conversationId, item.file)
        .pipe(finalize(() => this.isSendingMessage = false))
        .subscribe({
          next: (event) => {
            if (event.type === 1 && event.total) {
              const progress = Math.round(100 * (event.loaded || 0) / event.total);
              this.pendingAttachments = this.pendingAttachments.map(a => a.id === item.id ? { ...a, uploadProgress: progress } : a);
              this.messages = this.messages.map(m => m.id === tempId ? { ...m, uploadProgress: progress } : m);
            } else if (event.type === 4) {
              const attachment = event.body;
              const isImage = attachment?.type === 'image' || (attachment?.mimeType || '').startsWith('image/');
              const isAudio = attachment?.type === 'audio' || (attachment?.mimeType || '').startsWith('audio/');
              const type: 'text' | 'image' | 'file' | 'audio' | 'video' = isImage ? 'image' : (isAudio ? 'audio' : ((attachment?.mimeType || '').startsWith('video/') ? 'video' : 'file'));
              this.sendMessageUseCase.execute({ conversationId, content: attachment?.url || '', type: type as any })
                .subscribe({
                  next: (message) => {
                    const finalized = { ...message, state: 'ready', localPreviewUrl: item.previewUrl } as ChatMessage;
                    this.messages = this.messages.map(m => m.id === tempId ? finalized : m);
                    this.removePendingAttachment(item.id);
                    sendNext();
                  },
                  error: (err) => {
                    console.error('Error sending attachment message:', err);
                    this.messages = this.messages.map(m => m.id === tempId ? { ...m, state: 'error' } : m);
                  }
                });
            }
          },
          error: (error) => {
            console.error('Attachment upload error:', error);
            const msg = this.extractBackendErrorMessage(error);
            this.showTranslatedError(msg);
            this.messages = this.messages.map(m => m.id === tempId ? { ...m, state: 'error' } : m);
          }
        });
    };
    sendNext();
  }

  sendSingleAttachment(id: string): void {
    const conversationId = this.selectedConversationId;
    const item = this.pendingAttachments.find(a => a.id === id);
    if (!conversationId || !item) return;
    this.isSendingMessage = true;
    const tempId = `local-${id}`;
    const tempType: 'image' | 'audio' | 'file' | 'video' = item.type;
    const tempMessage: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: this.currentUserId || '',
      senderName: this.currentUser?.name || 'Yo',
      content: item.previewUrl,
      originalContent: item.previewUrl,
      type: tempType === 'video' ? 'file' : tempType,
      timestamp: new Date(),
      isRead: true,
      state: 'uploading',
      uploadProgress: 0,
      localPreviewUrl: item.previewUrl
    };
    this.messages = [...this.messages, tempMessage];
    this.chatApiService.uploadAttachmentWithProgress(conversationId, item.file)
      .pipe(finalize(() => this.isSendingMessage = false))
      .subscribe({
        next: (event) => {
          if (event.type === 1 && event.total) {
            const progress = Math.round(100 * (event.loaded || 0) / event.total);
            this.pendingAttachments = this.pendingAttachments.map(a => a.id === id ? { ...a, uploadProgress: progress } : a);
            this.messages = this.messages.map(m => m.id === tempId ? { ...m, uploadProgress: progress } : m);
          } else if (event.type === 4) {
            const attachment = event.body;
            const isImage = attachment?.type === 'image' || (attachment?.mimeType || '').startsWith('image/');
            const isAudio = attachment?.type === 'audio' || (attachment?.mimeType || '').startsWith('audio/');
            const type: 'text' | 'image' | 'file' | 'audio' | 'video' = isImage ? 'image' : (isAudio ? 'audio' : ((attachment?.mimeType || '').startsWith('video/') ? 'video' : 'file'));
            this.sendMessageUseCase.execute({ conversationId, content: attachment?.url || '', type: type as any })
              .subscribe({
                next: (message) => {
                  const finalized = { ...message, state: 'ready', localPreviewUrl: item.previewUrl } as ChatMessage;
                  this.messages = this.messages.map(m => m.id === tempId ? finalized : m);
                  this.removePendingAttachment(id);
                },
                error: (err) => {
                  console.error('Error sending attachment message:', err);
                  this.messages = this.messages.map(m => m.id === tempId ? { ...m, state: 'error' } : m);
                }
              });
          }
        },
        error: (error) => {
          console.error('Attachment upload error:', error);
          const msg = this.extractBackendErrorMessage(error);
          this.showTranslatedError(msg);
          this.messages = this.messages.map(m => m.id === tempId ? { ...m, state: 'error' } : m);
        }
      });
  }

  applyImageEdit(id: string, file: File): void {
    this.pendingAttachments = this.pendingAttachments.map(a => {
      if (a.id !== id) return a;
      try { URL.revokeObjectURL(a.previewUrl); } catch {}
      const previewUrl = URL.createObjectURL(file);
      return { ...a, file, previewUrl };
    });
  }

  applyAudioEdit(id: string, file: File): void {
    this.pendingAttachments = this.pendingAttachments.map(a => {
      if (a.id !== id) return a;
      try { URL.revokeObjectURL(a.previewUrl); } catch {}
      const previewUrl = URL.createObjectURL(file);
      return { ...a, file, previewUrl };
    });
  }

  applyVideoEdit(id: string, file: File): void {
    this.pendingAttachments = this.pendingAttachments.map(a => {
      if (a.id !== id) return a;
      try { URL.revokeObjectURL(a.previewUrl); } catch {}
      const previewUrl = URL.createObjectURL(file);
      return { ...a, file, previewUrl };
    });
  }

  onEmojiClick(): void {
    console.log('Emoji clicked');
    // TODO: Implement emoji picker functionality
  }

  onVoiceRecordingStart(): void {
    console.log('Voice recording started');
    // TODO: Implement voice recording functionality
  }

  onVoiceRecordingStop(): void {
    console.log('Voice recording stopped');
    // TODO: Implement voice recording functionality
  }

  onPhoneCall(): void {
    console.log('Phone call clicked');
    // TODO: Implement call functionality
  }

  onVideoCall(): void {
    console.log('Video call clicked');
    // TODO: Implement video call functionality
  }

  onMoreOptions(): void {
    console.log('More options clicked');
    // TODO: Implement more options functionality
  }

  onInputFocus(): void {
    // TODO: Handle input focus if needed
  }

  onInputBlur(): void {
    // TODO: Handle input blur if needed
  }

  onTypingChange(isTyping: boolean): void {
    if (!this.selectedConversationId) return;

    this.isTyping = isTyping;
    
    if (isTyping) {
      this.signalRService.startTyping(this.selectedConversationId);
    } else {
      this.signalRService.stopTyping(this.selectedConversationId);
    }
  }

  onMessageVisible(message: ChatMessage): void {
    // TODO: Mark message as read when visible
    console.log('Message visible:', message.id);
  }

  toggle(): void {
    this.opened = !this.opened;
  }

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  getUserNameFromLocalStorage(): string {
    const user = this.storageService.getUser();
    return user?.name || 'Usuario';
  }

  getUserEmailFromLocalStorage(): string {
    const user = this.storageService.getUser();
    return user?.email || '';
  }

  getSelectedConversationTitle(): string {
    const id = this.selectedConversationId;
    const fallback = this.selectedUser?.name || 'Usuario';
    if (!id) return fallback;
    const conv = (this.conversations || []).find(c => c.id.toString() === id.toString());
    if (!conv) return fallback;
    const display = (conv as any).displayName || (conv as any).cdisplayname;
    const name = (conv.name || '').trim();
    if (name) return name;
    if (display && String(display).trim()) return String(display);
    const other = (conv.participants || []).find(p => p.id !== this.currentUserId) || conv.participants?.[0];
    if (other?.name) return other.name;
    const lastSender = conv.lastMessage?.senderName;
    if (lastSender && lastSender.trim()) return lastSender;
    return fallback;
  }

  private simulateDownloadProgress(): void {
    console.log('[ChatPage] Simulating download progress...');
    this.translationDownloadProgress = 0;
    
    // Simulate download progress over 5-10 seconds
    const interval = setInterval(() => {
      this.translationDownloadProgress += Math.random() * 15 + 5; // 5-20% progress per interval
      
      if (this.translationDownloadProgress >= 95) {
        this.translationDownloadProgress = 95; // Keep at 95% until actual download completes
        clearInterval(interval);
      }
      
      // Stop simulation if status changes from downloading
      if (this.translationStatus !== 'downloading') {
        clearInterval(interval);
      }
    }, 500); // Update every 500ms
  }

}
