import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="relative inline-block"
      [ngClass]="sizeClasses"
    >
      <img 
        *ngIf="src; else initials"
        [src]="src" 
        [alt]="alt"
        class="w-full h-full object-cover rounded-full"
        [class.border-2]="showBorder"
        [class.border-white]="showBorder"
      />
      <ng-template #initials>
        <div 
          class="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white font-medium"
          [class.border-2]="showBorder"
          [class.border-white]="showBorder"
          [ngClass]="textSizeClasses"
        >
          {{ getInitials() }}
        </div>
      </ng-template>
      
      <!-- Online status indicator -->
      <div 
        *ngIf="showOnlineStatus && isOnline"
        class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
        [ngClass]="statusSizeClasses"
      ></div>
    </div>
  `,
  styles: []
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt: string = '';
  @Input() name: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showOnlineStatus: boolean = false;
  @Input() isOnline: boolean = false;
  @Input() showBorder: boolean = false;

  get sizeClasses(): string {
    const sizes = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20'
    };
    return sizes[this.size];
  }

  get textSizeClasses(): string {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    return sizes[this.size];
  }

  get statusSizeClasses(): string {
    const sizes = {
      xs: 'w-2 h-2',
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5'
    };
    return sizes[this.size];
  }

  getInitials(): string {
    if (!this.name) return '?';
    
    const words = this.name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
}