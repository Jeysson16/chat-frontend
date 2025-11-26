import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      *ngIf="shouldShow"
      [ngClass]="badgeClasses"
      class="inline-flex items-center justify-center font-medium rounded-full"
    >
      {{ displayText }}
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() count: number = 0;
  @Input() maxCount: number = 99;
  @Input() variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showZero: boolean = false;
  @Input() dot: boolean = false;

  get shouldShow(): boolean {
    return this.showZero || this.count > 0;
  }

  get displayText(): string {
    if (this.dot) return '';
    if (this.count > this.maxCount) return `${this.maxCount}+`;
    return this.count.toString();
  }

  get badgeClasses(): string {
    const variantClasses = this.getVariantClasses();
    const sizeClasses = this.getSizeClasses();
    
    return `${variantClasses} ${sizeClasses}`;
  }

  private getVariantClasses(): string {
    const variants = {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-white',
      danger: 'bg-red-500 text-white'
    };
    return variants[this.variant];
  }

  private getSizeClasses(): string {
    if (this.dot) {
      const dotSizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
      };
      return dotSizes[this.size];
    }

    const sizes = {
      sm: 'min-w-[16px] h-4 px-1 text-xs',
      md: 'min-w-[20px] h-5 px-1.5 text-sm',
      lg: 'min-w-[24px] h-6 px-2 text-base'
    };
    return sizes[this.size];
  }
}