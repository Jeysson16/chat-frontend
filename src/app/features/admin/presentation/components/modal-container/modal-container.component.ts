import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div *ngIf="show" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-gray-600 bg-opacity-40"></div>
      <div class="relative z-10 flex min-h-full items-center justify-center">
        <div class="w-full max-w-4xl shadow-xl rounded-xl bg-white">
          <div class="flex items-center justify-between px-6 pt-6">
            <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
            <button type="button" class="text-gray-500 hover:text-gray-700" (click)="cancel.emit()">✕</button>
          </div>

          <div class="px-6 pb-4 max-h-[70vh] overflow-y-auto">
            <ng-content></ng-content>
          </div>

          <div class="flex justify-end gap-3 px-6 py-4 border-t">
            <button mat-stroked-button type="button" (click)="cancel.emit()">{{ cancelLabel }}</button>
            <button mat-flat-button color="primary" type="button" [disabled]="disableSubmit || submitting" (click)="submit.emit()">
              {{ submitLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalContainerComponent {
  @Input() show = false;
  @Input() title = '';
  @Input() submitting = false;
  @Input() submitLabel = 'Guardar';
  @Input() cancelLabel = 'Cancelar';
  @Input() disableSubmit = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
}
