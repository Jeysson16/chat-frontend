export interface CompanyConfiguration {
  // Branding
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  
  // Customization
  customCss?: string;
  customJavaScript?: string;
  
  // Notifications
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  enablePushNotifications: boolean;
  
  // Chat Limits
  maxChannels: number;
  maxUsersPerChannel: number;
  maxMessageLength: number;
  
  // Storage and Performance
  storageQuotaGB: number;
  sessionTimeoutMinutes: number;
  
  // Features
  enableFileSharing: boolean;
  enableScreenSharing: boolean;
  enableVoiceMessages: boolean;
  enableVideoCall: boolean;
  enableGroupChat: boolean;
  
  // Security
  enableMessageEncryption: boolean;
  enableAuditLog: boolean;
  requireTwoFactor: boolean;
  
  // Integration
  enableWebhooks: boolean;
  webhookUrl?: string;
  enableApiAccess: boolean;
}

export class Company {
  constructor(
    public id: string,
    public applicationId: string,
    public name: string,
    public description: string,
    public domain: string,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public configuration?: CompanyConfiguration
  ) {}

  static create(
    applicationId: string,
    name: string,
    description: string,
    domain: string,
    configuration?: CompanyConfiguration
  ): Company {
    return new Company(
      '', // ID will be assigned by the backend
      applicationId,
      name,
      description,
      domain,
      true,
      new Date(),
      new Date(),
      configuration
    );
  }

  updateConfiguration(configuration: CompanyConfiguration): void {
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