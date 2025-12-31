import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-translation-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-black rounded-lg p-6 max-w-sm mx-4 shadow-xl border border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{{ title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ message }}</p>
            <div *ngIf="progress > 0" class="mt-2">
              <div class="bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div class="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300" [style.width.%]="progress"></div>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ progress }}% completado</p>
            </div>
          </div>
        </div>
        <div *ngIf="showCancelButton" class="mt-4 flex justify-end">
          <button 
            (click)="onCancel.emit()" 
            class="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class TranslationLoaderComponent {
  @Input() isVisible = false;
  @Input() title = 'Descargando modelos de traducción';
  @Input() message = 'Por favor espere mientras descargamos los modelos necesarios para traducir.';
  @Input() progress = 0;
  @Input() showCancelButton = false;
  @Output() onCancel = new EventEmitter<void>();
}
