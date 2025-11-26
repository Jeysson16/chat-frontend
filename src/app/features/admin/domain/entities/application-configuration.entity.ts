export interface ChatSettings {
  defaultChannelName: string;
  allowPrivateMessages: boolean;
  allowFileSharing: boolean;
  allowVideoCall: boolean;
  messageHistoryDays: number;
  messagesPerMinute: number;
  maxConnections: number;
  connectionTimeout: number;
}

export interface FeatureFlags {
  chatEnabled: boolean;
  fileUploadEnabled: boolean;
  videoCallEnabled: boolean;
  notificationsEnabled: boolean;
  encryptionEnabled: boolean;
  logCommunications: boolean;
}

export interface IntegrationConfig {
  signalR: {
    hubUrl: string;
  };
  emailService: {
    provider: string;
    apiKey: string;
  };
  authenticationLevel: 'basic' | 'oauth' | 'jwt' | 'api-key';
  tokenExpirationHours: number;
}

export interface FileSettings {
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFilesPerMessage: number;
}

export class ApplicationConfiguration {
  constructor(
    public readonly id: string,
    public readonly applicationId: string,
    public readonly chatSettings: ChatSettings,
    public readonly features: FeatureFlags,
    public readonly integrations: IntegrationConfig,
    public readonly fileSettings: FileSettings,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    id: string;
    applicationId: string;
    chatSettings: ChatSettings;
    features: FeatureFlags;
    integrations: IntegrationConfig;
    fileSettings: FileSettings;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): ApplicationConfiguration {
    return new ApplicationConfiguration(
      data.id,
      data.applicationId,
      data.chatSettings,
      data.features,
      data.integrations,
      data.fileSettings,
      data.isActive ?? true,
      data.createdAt || new Date(),
      data.updatedAt || new Date()
    );
  }

  updateChatSettings(chatSettings: ChatSettings): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      chatSettings,
      this.features,
      this.integrations,
      this.fileSettings,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateFeatures(features: FeatureFlags): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      this.chatSettings,
      features,
      this.integrations,
      this.fileSettings,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateIntegrations(integrations: IntegrationConfig): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      this.chatSettings,
      this.features,
      integrations,
      this.fileSettings,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  updateFileSettings(fileSettings: FileSettings): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      this.chatSettings,
      this.features,
      this.integrations,
      fileSettings,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  activate(): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      this.chatSettings,
      this.features,
      this.integrations,
      this.fileSettings,
      true,
      this.createdAt,
      new Date()
    );
  }

  deactivate(): ApplicationConfiguration {
    return new ApplicationConfiguration(
      this.id,
      this.applicationId,
      this.chatSettings,
      this.features,
      this.integrations,
      this.fileSettings,
      false,
      this.createdAt,
      new Date()
    );
  }
}