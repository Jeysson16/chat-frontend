import { Injectable } from '@angular/core';

export interface ChatConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
  language: string;
  translationEnabled: boolean;
  userStatus: string;
  contactSource: string;
  conversationApiMode: string;
  modoGestionContactos?: string;
  tipoListadoContactos?: string;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string;
}

export interface ApplicationData {
  code: string;
  name: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CHAT_CONFIG_KEY = 'chatConfig';
  private readonly USER_KEY = 'user';
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly APPLICATION_KEY = 'application';

  constructor() {}

  // Chat Config methods
  getChatConfig(): ChatConfig {
    const config = localStorage.getItem(this.CHAT_CONFIG_KEY);
    if (config) {
      try {
        return JSON.parse(config);
      } catch {
        return this.getDefaultChatConfig();
      }
    }
    return this.getDefaultChatConfig();
  }

  setChatConfig(config: Partial<ChatConfig>): void {
    const currentConfig = this.getChatConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem(this.CHAT_CONFIG_KEY, JSON.stringify(newConfig));
  }

  private getDefaultChatConfig(): ChatConfig {
    return {
      theme: 'light',
      primaryColor: '#3B82F6',
      language: 'es',
      translationEnabled: true,
      userStatus: 'online',
      contactSource: 'ChatContacto',
      conversationApiMode: 'modern'
    };
  }

  // User methods
  getUser(): UserData | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return null;
  }

  setUser(user: UserData): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Auth Token methods
  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  // Application methods
  getApplication(): ApplicationData | null {
    const app = localStorage.getItem(this.APPLICATION_KEY);
    if (app) {
      try {
        return JSON.parse(app);
      } catch {
        return null;
      }
    }
    return null;
  }

  setApplication(application: ApplicationData): void {
    localStorage.setItem(this.APPLICATION_KEY, JSON.stringify(application));
  }

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(this.CHAT_CONFIG_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.APPLICATION_KEY);
  }

  // Migration method to move from old format to new format
  migrateFromOldFormat(): void {
    const oldKeys = [
      'chat-theme', 'chat_theme', 'chat-primary-color', 'chat_primary_color',
      'chat_language', 'chat_translation_enabled', 'chat_user_status',
      'chat_contact_source', 'chat_conversation_api_mode', 'chat_modo_gestion_contactos',
      'tipo_listado_contactos', 'chat_mode_option_contacts'
    ];

    const chatConfig: Partial<ChatConfig> = {};
    
    // Migrate theme
    const theme = localStorage.getItem('chat-theme') || localStorage.getItem('chat_theme');
    if (theme) {
      chatConfig.theme = theme as 'light' | 'dark';
    }

    // Migrate primary color
    const primaryColor = localStorage.getItem('chat-primary-color') || localStorage.getItem('chat_primary_color');
    if (primaryColor) {
      chatConfig.primaryColor = primaryColor;
    }

    // Migrate language
    const language = localStorage.getItem('chat_language');
    if (language) {
      chatConfig.language = language;
    }

    // Migrate translation enabled
    const translationEnabled = localStorage.getItem('chat_translation_enabled');
    if (translationEnabled) {
      chatConfig.translationEnabled = translationEnabled === 'true';
    }

    // Migrate user status
    const userStatus = localStorage.getItem('chat_user_status');
    if (userStatus) {
      chatConfig.userStatus = userStatus;
    }

    // Migrate contact source
    const contactSource = localStorage.getItem('chat_contact_source');
    if (contactSource) {
      chatConfig.contactSource = contactSource;
    }

    // Migrate conversation API mode
    const conversationApiMode = localStorage.getItem('chat_conversation_api_mode');
    if (conversationApiMode) {
      chatConfig.conversationApiMode = conversationApiMode;
    }

    // Migrate modo gestion contactos
    const modoGestion = localStorage.getItem('chat_modo_gestion_contactos');
    if (modoGestion) {
      chatConfig.modoGestionContactos = modoGestion;
    }

    // Migrate tipo listado contactos
    const tipoListado = localStorage.getItem('tipo_listado_contactos');
    if (tipoListado) {
      chatConfig.tipoListadoContactos = tipoListado;
    }

    // Apply migrated config if any values were found
    if (Object.keys(chatConfig).length > 0) {
      this.setChatConfig(chatConfig);
      
      // Clean up old keys
      oldKeys.forEach(key => localStorage.removeItem(key));
    }
  }
}