import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="handleClick()"
      [ngClass]="buttonClasses"
      class="inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div *ngIf="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = this.getBaseClasses();
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    const widthClasses = this.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClasses}`.trim();
  }

  private getBaseClasses(): string {
    return 'rounded-lg border transition-all duration-200';
  }

  private getVariantClasses(): string {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 focus:ring-blue-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 focus:ring-gray-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500'
    };
    return variants[this.variant];
  }

  private getSizeClasses(): string {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    return sizes[this.size];
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}