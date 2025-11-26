export interface BrandingConfig {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  theme: 'light' | 'dark';
  customCss: string;
  faviconUrl: string;
}

export interface ChatLimits {
  maxUsersPerChannel: number;
  maxChannelsPerCompany: number;
  messageRetentionDays: number;
  maxMessageLength: number;
}

export interface CustomizationConfig {
  welcomeMessage: string;
  chatTheme: 'light' | 'dark' | 'auto';
  customFields: Record<string, any>;
  enabledFeatures: string[];
  customModules: string[];
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export class CompanyConfigurationEntity {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly applicationId: string,
    public readonly branding: BrandingConfig,
    public readonly chatLimits: ChatLimits,
    public readonly customizations: CustomizationConfig,
    public readonly notifications: NotificationSettings,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    companyId: string;
    applicationId: string;
    branding: BrandingConfig;
    chatLimits: ChatLimits;
    customizations: CustomizationConfig;
    notifications: NotificationSettings;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      data.id,
      data.companyId,
      data.applicationId,
      data.branding,
      data.chatLimits,
      data.customizations,
      data.notifications,
      data.isActive ?? true,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  updateBranding(branding: BrandingConfig): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      branding,
      this.chatLimits,
      this.customizations,
      this.notifications,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateChatLimits(chatLimits: ChatLimits): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      this.branding,
      chatLimits,
      this.customizations,
      this.notifications,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateCustomizations(customizations: CustomizationConfig): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      this.branding,
      this.chatLimits,
      customizations,
      this.notifications,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateNotifications(notifications: NotificationSettings): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      this.branding,
      this.chatLimits,
      this.customizations,
      notifications,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  activate(): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      this.branding,
      this.chatLimits,
      this.customizations,
      this.notifications,
      true,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): CompanyConfigurationEntity {
    return new CompanyConfigurationEntity(
      this.id,
      this.companyId,
      this.applicationId,
      this.branding,
      this.chatLimits,
      this.customizations,
      this.notifications,
      false,
      this.createdAt,
      new Date()
    );
  }
}