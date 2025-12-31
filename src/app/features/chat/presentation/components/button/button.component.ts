import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="type" [disabled]="disabled || loading" (click)="handleClick()" class="inline-flex items-center justify-center rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      [ngClass]="variantClasses + ' ' + sizeClasses">
      <div *ngIf="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<void>();

  get variantClasses(): string {
    const v = {
      primary: 'bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white border-[var(--primary-color)] focus:ring-[var(--primary-color)]',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 focus:ring-gray-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500'
    };
    return v[this.variant];
  }
  get sizeClasses(): string {
    const s = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' };
    return s[this.size];
  }
  handleClick(): void { if (!this.disabled && !this.loading) this.clicked.emit(); }
}
