import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg [ngClass]="iconClasses" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ng-container [ngSwitch]="name">
        <path *ngSwitchCase="'attachment'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32"/>
        <path *ngSwitchCase="'emoji'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        <path *ngSwitchCase="'microphone'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v6m0 0a3 3 0 013 3v4a3 3 0 11-6 0v-4a3 3 0 013-3zM19 10v2a7 7 0 11-14 0v-2"/>
        <path *ngSwitchCase="'send'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
        <circle *ngSwitchDefault cx="12" cy="12" r="10"/>
      </ng-container>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  get iconClasses(): string {
    const s = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8' };
    return `${s[this.size]} flex-shrink-0`;
  }
}
