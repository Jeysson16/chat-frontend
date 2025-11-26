import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../infrastructure/services/translation.service';

@Pipe({
  name: 'translateLabel',
  standalone: true,
  pure: true
})
export class TranslateLabelPipe implements PipeTransform {
  private translationService = inject(TranslationService);
  private cache = new Map<string, string>();

  transform(text: string, targetLanguage?: string): string {
    if (!text) return '';
    
    // Si no hay idioma objetivo, usar el idioma actual del servicio
    const currentLang = targetLanguage || this.translationService.getCurrentConfig()?.targetLanguage || 'es';
    const cacheKey = `${text}_${currentLang}`;
    
    // Verificar caché primero
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Verificar si el servicio está disponible
    const translatorStatus = this.translationService.getTranslatorStatus();
    if (translatorStatus !== 'ready') {
      console.log(`[TranslateLabelPipe] Translator not ready (${translatorStatus}), returning original: "${text}"`);
      return text;
    }
    
    // Iniciar traducción asíncrona pero devolver texto original por ahora
    // La traducción se actualizará en el próximo ciclo de detección de cambios
    this.translationService.translateMessage(text, currentLang)
      .then(translated => {
        console.log(`[TranslateLabelPipe] Translation result: "${translated}"`);
        this.cache.set(cacheKey, translated);
        
        // Forzar actualización del DOM (esto es un workaround)
        // En producción, deberíamos usar un servicio de estado o signals
        const event = new CustomEvent('translationComplete', { detail: { key: cacheKey, text: translated } });
        document.dispatchEvent(event);
      })
      .catch(error => {
        console.error(`[TranslateLabelPipe] Translation failed:`, error);
        // No hacer nada, mantener el texto original en caché
        this.cache.set(cacheKey, text);
      });
    
    // Devolver el texto original por ahora
    return text;
  }
}