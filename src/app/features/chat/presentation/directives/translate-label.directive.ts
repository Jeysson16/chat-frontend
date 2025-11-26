import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslationService } from '../../infrastructure/services/translation.service';

@Directive({
  selector: '[translateLabel]',
  standalone: true
})
export class TranslateLabelDirective implements OnInit, OnDestroy {
  @Input('translateLabel') text!: string;
  @Input() targetLanguage?: string;
  
  private translationService = inject(TranslationService);
  private originalText: string = '';
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    console.log(`[TranslateLabelDirective] ngOnInit called with text: "${this.text}"`);
    if (!this.text) return;
    
    this.originalText = this.text;
    this.translateText();
    
    // Listen for re-translation events
    this.translationService.getRetranslationObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log(`[TranslateLabelDirective] Retranslation event received for: "${this.originalText}"`);
        this.translateText();
      });
  }

  private async translateText(): Promise<void> {
    const translatorStatus = this.translationService.getTranslatorStatus();
    const enabled = (this.translationService as any).isEnabled ? (this.translationService as any).isEnabled() : true;
    console.log(`[TranslateLabelDirective] Translator status: ${translatorStatus}, enabled: ${enabled}`);
    
    // Obtener idioma objetivo
    const currentLang = this.targetLanguage || ((this.translationService as any).getTargetLanguage?.() || this.translationService.getCurrentConfig()?.targetLanguage) || 'es';
    const currentConfig = this.translationService.getCurrentConfig();
    const sourceLang = currentConfig?.sourceLanguage || 'en';
    
    console.log(`[TranslateLabelDirective] Current config: source=${sourceLang}, target=${currentLang}`);
    
    if (!enabled || sourceLang === currentLang || currentLang === 'en') {
      const element = this.el.nativeElement;
      if (element) {
        element.textContent = this.originalText;
      }
      return;
    }
    
    console.log(`[TranslateLabelDirective] Translating label: "${this.originalText}" from ${sourceLang} to ${currentLang}`);
    
    try {
      const translated = await this.translationService.translateMessage(this.originalText, currentLang);
      console.log(`[TranslateLabelDirective] Translation result: "${translated}"`);
      
      if (translated && translated !== this.originalText) {
        // Actualizar el texto del elemento
        const element = this.el.nativeElement;
        if (element) {
          console.log(`[TranslateLabelDirective] Updating element text from "${this.originalText}" to "${translated}"`);
          element.textContent = translated;
        }
      } else {
        console.log(`[TranslateLabelDirective] No translation needed or failed, keeping original: "${this.originalText}"`);
      }
    } catch (error) {
      console.error(`[TranslateLabelDirective] Translation failed:`, error);
      // Mantener el texto original en caso de error
    }
  }

  private isSpanishText(text: string): boolean {
    // Simple heuristic to detect if text is already in Spanish
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para'];
    const lowerText = text.toLowerCase();
    return spanishWords.some(word => lowerText.includes(word));
  }

  constructor(private el: ElementRef) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
