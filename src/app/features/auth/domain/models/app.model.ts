// DEPRECATED: Use application.model.ts instead
// This file is kept for backward compatibility but will be removed
export interface AppModel{
    appCode: string;
    appName: string;
    accessToken: string;  // ⚠️ SECURITY RISK - Should not be stored in frontend
    secretToken: string;   // ⚠️ SECURITY RISK - Should not be stored in frontend
}

// Use Application from application.model.ts instead
export { Application } from './application.model';
