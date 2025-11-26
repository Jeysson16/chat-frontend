export interface Configuration {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'system' | 'application' | 'company' | 'user';
  description?: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isEncrypted: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: any;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value?: any;
  message: string;
}

export interface ConfigurationGroup {
  category: string;
  name: string;
  description?: string;
  configurations: Configuration[];
  isCollapsed?: boolean;
}

export interface ConfigurationCreate {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'system' | 'application' | 'company' | 'user';
  description?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  isEncrypted?: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: any;
}

export interface ConfigurationUpdate {
  id: string;
  value?: any;
  description?: string;
  isRequired?: boolean;
  isReadOnly?: boolean;
  validationRules?: ValidationRule[];
}

export interface ConfigurationBulkUpdate {
  configurations: {
    id: string;
    value: any;
  }[];
}

export interface ConfigurationHistory {
  id: string;
  configurationId: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}