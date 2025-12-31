import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, input, computed } from '@angular/core';
import { AvatarComponent } from '../../../../../shared/components/atoms/avatar/avatar.component';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../../../shared/components/atoms/icon/icon.component';
import { ChatUser } from '../../../domain/models/chat.model';
import { TranslateLabelDirective } from '../../../presentation/directives/translate-label.directive';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, AvatarComponent, ButtonComponent, IconComponent, TranslateLabelDirective],
  template: `
    <div class="flex items-center justify-start px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <app-avatar [src]="userSig()?.avatar" [name]="userSig()?.name || ''" [alt]="userSig()?.name || ''" [size]="'md'"></app-avatar>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title || (userSig()?.name || '') }}</h2>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span *ngIf="userSig()?.isOnline" class="inline-flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              <span translateLabel="Online"></span>
            </span>
            <span *ngIf="!userSig()?.isOnline && userSig()?.lastSeen" class="inline-flex items-center text-gray-500 dark:text-gray-400">
              <span class="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
              <span translateLabel="Last seen"></span>: {{ formatLastSeen(userSig()?.lastSeen) }}
            </span>
            <span *ngIf="!userSig()?.isOnline && !userSig()?.lastSeen" class="inline-flex items-center text-gray-500 dark:text-gray-400">
              <span class="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
              <span translateLabel="Offline"></span>
            </span>
          </div>
        </div>
      </div>

      
    </div>
  `,
  styles: []
})
export class ChatHeaderComponent {
  userSig = input.required<ChatUser>({ alias: 'user' });
  @Input() title: string | null = null;
  @Input() isTranslationEnabled: boolean = false;
  @Input() currentLanguage: string = 'es';
  @Output() phoneCall = new EventEmitter<void>();
  @Output() videoCall = new EventEmitter<void>();
  @Output() moreOptions = new EventEmitter<void>();
  @Output() translationToggle = new EventEmitter<boolean>();

  
  
  statusLabel = computed(() => (this.userSig()?.isOnline ? 'Online' : (this.userSig()?.lastSeen ? 'Last seen' : 'Offline')));

  onPhoneCall(): void {
    this.phoneCall.emit();
  }

  onVideoCall(): void {
    this.videoCall.emit();
  }

  onMoreOptions(): void {
    this.moreOptions.emit();
  }

  onTranslationToggle(): void {
    console.log('[ChatHeader] Translation toggle clicked, current state:', this.isTranslationEnabled);
    this.translationToggle.emit(!this.isTranslationEnabled);
  }

  formatLastSeen(lastSeen?: Date): string {
    if (!lastSeen) return '';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      if (days === 1) {
        return 'yesterday';
      } else if (days < 7) {
        return `${days} days ago`;
      } else {
        return lastSeen.toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      }
    }
  }
}
