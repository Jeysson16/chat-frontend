import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '@/app/features/chat/infrastructure/services/translation.service';

@Component({
  selector: 'app-translation-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleTranslation()"
        class="p-2 rounded-lg transition-colors duration-200 bg-white dark:bg-black"
        [style.backgroundColor]="isTranslationEnabled ? 'var(--primary-color)' : null"
        [style.color]="isTranslationEnabled ? '#ffffff' : null"
        [class.hover:bg-[var(--primary-color-hover)]]="isTranslationEnabled"
        [title]="getTooltipText()"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
        </svg>
      </button>
      
      <!-- Language selector dropdown -->
      <div *ngIf="showLanguageSelector" class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-black rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
        <div class="p-2">
          <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Translate to:</h3>
          <div class="space-y-1">
            <button
              *ngFor="let lang of availableLanguages"
              (click)="selectLanguage(lang.code)"
              [style.backgroundColor]="currentLanguage === lang.code ? 'var(--primary-color-light)' : null"
              [style.color]="currentLanguage === lang.code ? 'var(--primary-color)' : null"
              class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-900 dark:text-gray-100"
            >
              {{ lang.name }}
            </button>
          </div>
          <div class="border-t border-gray-200 mt-2 pt-2">
            <button
              (click)="disableTranslation()"
              class="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              Disable translation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TranslationButtonComponent implements OnInit {
  @Input() isTranslationEnabled: boolean = false;
  @Input() currentLanguage: string = 'en';
  @Output() translationToggle = new EventEmitter<boolean>();
  @Output() languageChange = new EventEmitter<string>();

  showLanguageSelector: boolean = false;
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'hi', name: 'हिन्दी' }
  ];

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    // Check if translation is supported
    if (!this.translationService.isTranslationSupported()) {
      this.isTranslationEnabled = false;
    }
  }

  toggleTranslation(): void {
    if (!this.translationService.isTranslationSupported()) {
      alert('Translation is not supported in your browser');
      return;
    }

    if (this.isTranslationEnabled) {
      this.showLanguageSelector = !this.showLanguageSelector;
    } else {
      this.enableTranslation();
    }
  }

  enableTranslation(): void {
    this.isTranslationEnabled = true;
    this.translationToggle.emit(true);
    this.showLanguageSelector = true;
  }

  disableTranslation(): void {
    this.isTranslationEnabled = false;
    this.translationToggle.emit(false);
    this.showLanguageSelector = false;
  }

  selectLanguage(languageCode: string): void {
    this.currentLanguage = languageCode;
    this.languageChange.emit(languageCode);
    this.showLanguageSelector = false;
  }

  getTooltipText(): string {
    if (!this.translationService.isTranslationSupported()) {
      return 'Translation not supported';
    }
    
    if (this.isTranslationEnabled) {
      const lang = this.availableLanguages.find(l => l.code === this.currentLanguage);
      return `Translation enabled (${lang?.name || this.currentLanguage})`;
    }
    
    return 'Enable translation';
  }
}
