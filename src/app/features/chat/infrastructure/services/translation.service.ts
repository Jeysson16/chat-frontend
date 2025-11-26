import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FallbackTranslationService } from './fallback-translation.service';

export interface TranslationConfig {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslatorInstance {
  sourceLanguage: string;
  targetLanguage: string;
  translate(text: string): Promise<string>;
  translateStreaming(text: string): ReadableStream;
  measureInputUsage(text: string): Promise<number>;
  destroy(): void;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translator: TranslatorInstance | null = null;
  private isSupported: boolean = false;
  private currentConfig: TranslationConfig | null = null;
  private retranslationSubject = new Subject<void>();
  private enabled: boolean = true;
  private currentTargetLanguage: string = 'es';

  constructor(private fallbackService: FallbackTranslationService) {
    this.checkSupport();
  }

  private checkSupport(): void {
    console.log('[TranslationService] Checking browser support for Translator API');
    console.log('[TranslationService] Window object:', typeof window);
    console.log('[TranslationService] Window.translation object:', (window as any).translation);
    console.log('[TranslationService] Window.Translator object:', (window as any).Translator);
    
    // Check for both lowercase and uppercase variants
    if (typeof window !== 'undefined' && ('translation' in window || 'Translator' in window)) {
      this.isSupported = true;
      console.log('[TranslationService] Translator API is supported');
      if ((window as any).translation) {
        console.log('[TranslationService] Available methods on translation:', Object.keys((window as any).translation));
      }
      if ((window as any).Translator) {
        console.log('[TranslationService] Available methods on Translator:', Object.keys((window as any).Translator));
      }
      
      // Test the API immediately
      this.testAPIAvailability();
    } else {
      console.log('[TranslationService] Translator API is NOT supported');
      if (typeof window !== 'undefined') {
        console.log('[TranslationService] Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('translation') || key.includes('translator')));
        console.log('[TranslationService] User agent:', navigator.userAgent);
        console.log('[TranslationService] Chrome version check:', navigator.userAgent.includes('Chrome'));
      }
    }
  }

  private async testAPIAvailability(): Promise<void> {
    try {
      const translationAPI = (window as any).translation || (window as any).Translator;
      if (translationAPI && translationAPI.availability) {
        console.log('[TranslationService] Testing API availability...');
        const availability = await translationAPI.availability({ sourceLanguage: 'es', targetLanguage: 'en' });
        console.log('[TranslationService] API availability test result:', availability);
      }
    } catch (error) {
      console.error('[TranslationService] API availability test failed:', error);
    }
  }

  async initializeTranslator(config: TranslationConfig): Promise<boolean> {
    console.log('[TranslationService] Initializing translator with config:', config);
    
    if (!this.isSupported) {
      console.warn('[TranslationService] Translator API not supported in this browser');
      return false;
    }

    try {
      // Destroy existing translator if any
      if (this.translator) {
        console.log('[TranslationService] Destroying existing translator');
        this.translator.destroy();
        this.translator = null;
      }

      console.log('[TranslationService] Checking availability for config:', config);
      
      // Skip initialization if source and target are the same
      if (config.sourceLanguage === config.targetLanguage) {
        console.log('[TranslationService] Source and target languages are the same, skipping translator initialization');
        this.currentConfig = config;
        return true; // Consider this a success since no translation is needed
      }
      
      // Determine which API object to use
      const translationAPI = (window as any).translation || (window as any).Translator;
      
      // Check availability first using the proper API
      const availability = await translationAPI.availability(config);
      console.log('[TranslationService] Translation availability result:', availability);
      
      if (availability === 'available') {
        console.log('[TranslationService] Creating translator instance');
        // Create the translator instance with proper configuration
        this.translator = await translationAPI.create(config);
        this.currentConfig = config;
        this.currentTargetLanguage = config.targetLanguage;
        console.log('[TranslationService] Translator initialized successfully', config);
        return true;
      } else if (availability === 'downloadable') {
        console.log('[TranslationService] Translation models need to be downloaded');
        // Return false but indicate that models are downloadable
        return false;
      } else {
        console.warn('[TranslationService] Translation not available for the requested languages:', availability);
        return false;
      }
    } catch (error) {
      console.error('[TranslationService] Error initializing translator:', error);
      this.translator = null;
      this.currentConfig = null;
      return false;
    }
  }

  async downloadTranslationModels(config: TranslationConfig): Promise<boolean> {
    console.log('[TranslationService] Downloading translation models for config:', config);
    
    if (!this.isSupported) {
      console.warn('[TranslationService] Translator API not supported in this browser');
      return false;
    }

    try {
      const translationAPI = (window as any).translation || (window as any).Translator;
      
      // Check if models are downloadable
      const availability = await translationAPI.availability(config);
      if (availability !== 'downloadable') {
        console.warn('[TranslationService] Models are not downloadable:', availability);
        return false;
      }

      console.log('[TranslationService] Starting model download...');
      
      // Create translator instance - this should trigger the download
      this.translator = await translationAPI.create(config);
      this.currentConfig = config;
      
      console.log('[TranslationService] Translation models downloaded successfully');
      return true;
      
    } catch (error) {
      console.error('[TranslationService] Error downloading translation models:', error);
      return false;
    }
  }

  async translateMessage(text: string, targetLanguage?: string): Promise<string> {
    console.log(`[TranslationService] translateMessage called with text: "${text}", targetLanguage: ${targetLanguage}`);

    if (!this.enabled) {
      console.log('[TranslationService] Translation disabled, returning original text');
      return text;
    }
    
    if (!this.translator) {
      console.warn('[TranslationService] Translator not initialized, trying fallback');
      // Try fallback translation service
      const targetLang = targetLanguage || this.currentTargetLanguage || this.currentConfig?.targetLanguage || 'es';
      if (targetLang === 'en') {
        return text;
      }
      const fallbackResult = this.fallbackService.translate(text, targetLang);
      if (fallbackResult !== text) {
        console.log(`[TranslationService] Fallback translation successful: "${fallbackResult}"`);
        return fallbackResult;
      }
      return text;
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.log('[TranslationService] Invalid input text, returning original');
      return text;
    }

    console.log(`[TranslationService] Current translator config:`, this.currentConfig);
    console.log(`[TranslationService] Translator target language: ${this.translator.targetLanguage}`);

    // If target language is different from current config, reinitialize
    if (targetLanguage && targetLanguage !== this.translator.targetLanguage) {
      console.log(`[TranslationService] Reinitializing translator for target language: ${targetLanguage}`);
      const success = await this.initializeTranslator({
        sourceLanguage: this.translator.sourceLanguage,
        targetLanguage: targetLanguage
      });
      
      if (!success) {
        console.warn('[TranslationService] Failed to reinitialize translator for target language:', targetLanguage);
        // Try fallback
        const fallbackResult = this.fallbackService.translate(text, targetLanguage);
        if (fallbackResult !== text) {
          console.log(`[TranslationService] Fallback translation successful after failed reinit: "${fallbackResult}"`);
          return fallbackResult;
        }
        return text;
      }
    }

    try {
      console.log(`[TranslationService] Starting translation of text: "${text}"`);
      // Check input quota before translating
      const inputUsage = await this.translator.measureInputUsage(text);
      if (inputUsage > 0) {
        console.log(`[TranslationService] Translation input usage: ${inputUsage}`);
      }

      const translated = await this.translator.translate(text);
      console.log(`[TranslationService] Translation result: "${translated}"`);
      
      // Validate translation result
      if (!translated || typeof translated !== 'string') {
        console.warn('[TranslationService] Invalid translation result from browser API, trying fallback');
        const targetLang = targetLanguage || this.currentTargetLanguage || this.currentConfig?.targetLanguage || 'es';
        const fallbackResult = this.fallbackService.translate(text, targetLang);
        if (fallbackResult !== text) {
          console.log(`[TranslationService] Fallback translation successful after invalid result: "${fallbackResult}"`);
          return fallbackResult;
        }
        return text;
      }
      
      // If browser API returned the same text (no translation), try fallback
      if (translated === text) {
        console.log('[TranslationService] Browser API returned same text, trying fallback');
        const targetLang = targetLanguage || this.currentTargetLanguage || this.currentConfig?.targetLanguage || 'es';
        const fallbackResult = this.fallbackService.translate(text, targetLang);
        if (fallbackResult !== text) {
          console.log(`[TranslationService] Fallback translation successful after same result: "${fallbackResult}"`);
          return fallbackResult;
        }
      }
      
      return translated;
    } catch (error) {
      console.error('[TranslationService] Error translating message:', error);
      
      // Try fallback on any error
      const targetLang = targetLanguage || this.currentTargetLanguage || this.currentConfig?.targetLanguage || 'es';
      const fallbackResult = this.fallbackService.translate(text, targetLang);
      if (fallbackResult !== text) {
        console.log(`[TranslationService] Fallback translation successful after error: "${fallbackResult}"`);
        return fallbackResult;
      }
      
      // Check if it's a quota exceeded error
      if (error instanceof Error && error.message.includes('quota')) {
        console.warn('[TranslationService] Translation quota exceeded, returning original text');
      }
      
      return text;
    }
  }

  async translateMessageStream(text: string, targetLanguage?: string): Promise<ReadableStream> {
    if (!this.translator) {
      console.warn('Translator not initialized');
      return this.createFallbackStream(text);
    }

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return this.createFallbackStream(text);
    }

    // If target language is different from current config, reinitialize
    if (targetLanguage && targetLanguage !== this.translator.targetLanguage) {
      const success = await this.initializeTranslator({
        sourceLanguage: this.translator.sourceLanguage,
        targetLanguage: targetLanguage
      });
      
      if (!success) {
        console.warn('Failed to reinitialize translator for streaming');
        return this.createFallbackStream(text);
      }
    }

    try {
      // Check input quota before translating
      const inputUsage = await this.translator.measureInputUsage(text);
      if (inputUsage > 0) {
        console.log(`Streaming translation input usage: ${inputUsage}`);
      }

      return this.translator.translateStreaming(text);
    } catch (error) {
      console.error('Error creating translation stream:', error);
      
      // Check if it's a quota exceeded error
      if (error instanceof Error && error.message.includes('quota')) {
        console.warn('Translation quota exceeded for streaming, returning original text');
      }
      
      return this.createFallbackStream(text);
    }
  }

  private createFallbackStream(text: string): ReadableStream {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(text);
        controller.close();
      }
    });
  }

  async checkAvailability(config: TranslationConfig): Promise<string> {
    if (!this.isSupported) {
      return 'not-supported';
    }

    try {
      // Determine which API object to use
      const translationAPI = (window as any).translation || (window as any).Translator;
      const availability = await translationAPI.availability(config);
      return availability; // 'available', 'unavailable', or 'downloadable'
    } catch (error) {
      console.error('Error checking translation availability:', error);
      return 'unavailable';
    }
  }

  getSupportedLanguages(): Promise<string[]> {
    if (!this.isSupported) {
      return Promise.resolve([]);
    }

    // This would ideally come from the Translator API
    // For now, return common language codes based on MDN documentation examples
    return Promise.resolve([
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'nl', 'pl', 'tr'
    ]);
  }

  getCurrentConfig(): TranslationConfig | null {
    return this.currentConfig;
  }

  isTranslationSupported(): boolean {
    return this.isSupported;
  }

  getTranslatorStatus(): string {
    if (!this.isSupported) {
      return 'not-supported';
    }
    
    if (!this.translator) {
      return 'not-initialized';
    }
    
    return 'ready';
  }

  getInputQuota(): Promise<number> {
    if (!this.translator) {
      return Promise.resolve(0);
    }

    try {
      // Get the input quota from the translator instance
      const quota = (this.translator as any).inputQuota;
      return Promise.resolve(quota || 0);
    } catch (error) {
      console.error('Error getting input quota:', error);
      return Promise.resolve(0);
    }
  }

  getCurrentLanguages(): { sourceLanguage: string; targetLanguage: string } | null {
    if (!this.translator) {
      return null;
    }

    return {
      sourceLanguage: this.translator.sourceLanguage,
      targetLanguage: this.translator.targetLanguage
    };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setTargetLanguage(lang: string): void {
    this.currentTargetLanguage = lang;
    if (this.currentConfig) {
      this.currentConfig = { sourceLanguage: this.currentConfig.sourceLanguage || 'en', targetLanguage: lang };
    }
  }

  getTargetLanguage(): string {
    return this.currentTargetLanguage;
  }

  getRetranslationObservable() {
    return this.retranslationSubject.asObservable();
  }

  triggerRetranslation(): void {
    console.log('[TranslationService] Triggering re-translation for all labels');
    this.retranslationSubject.next();
  }

  destroy(): void {
    if (this.translator) {
      this.translator.destroy();
      this.translator = null;
    }
  }
}
