export interface ApplicationSettings {
  // File Upload Settings
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Security Settings
  enableTwoFactor: boolean;
  passwordMinLength: number;
  sessionTimeoutMinutes: number;
  
  // Rate Limiting
  maxRequestsPerMinute: number;
  maxConcurrentConnections: number;
  
  // Authentication
  enableSocialLogin: boolean;
  enableGuestAccess: boolean;
  
  // Features
  enableNotifications: boolean;
  enableAnalytics: boolean;
  enableFileSharing: boolean;
  
  // UI Customization
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customFont: string;
}

export interface AppRegistroTokens {
  accessToken: string;
  secretToken: string;
  expirationDate: Date;
}

export class Application {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public code: string,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public configuration?: ApplicationSettings,
    public tokens?: AppRegistroTokens
  ) {}

  static create(
    name: string,
    description: string,
    code: string,
    configuration?: ApplicationSettings,
    tokens?: AppRegistroTokens
  ): Application {
    return new Application(
      '', // ID will be assigned by the backend
      name,
      description,
      code,
      true,
      new Date(),
      new Date(),
      configuration,
      tokens
    );
  }

  updateConfiguration(configuration: ApplicationSettings): void {
    this.configuration = configuration;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}