import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarComponent } from '../../../../../shared/components/atoms/avatar/avatar.component';
import { ChatMessage } from '../../../domain/models/chat.model';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div [ngClass]="messageContainerClasses">
      <!-- Avatar for received messages -->
      <app-avatar
        *ngIf="!isOwnMessage"
        src=""
        [alt]="message.senderName"
        [size]="'sm'"
        class="flex-shrink-0"
      ></app-avatar>
      
      <div [ngClass]="messageBubbleClasses">
        <div class="break-words" *ngIf="message.type === 'text'">
          {{ message.content }}
        </div>
        <div *ngIf="message.type === 'image'" class="max-w-xs lg:max-w-md">
          <img [src]="message.content" alt="image" class="rounded-md max-h-64 object-cover" />
        </div>
        <div *ngIf="message.type === 'audio'" class="flex items-center space-x-2 w-full">
          <audio [src]="message.content" controls class="w-full"></audio>
        </div>
        <div *ngIf="message.type === 'file'" class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <a [href]="message.content" target="_blank" rel="noopener" class="underline">
            {{ getFileName(message.content) }}
          </a>
        </div>
        
        <!-- Timestamp -->
        <div [ngClass]="timestampClasses">
          {{ formatTime(message.timestamp) }}
        </div>
        
        <!-- Message status for own messages -->
        <div *ngIf="isOwnMessage" class="flex items-center space-x-1 mt-1">
          <div [ngClass]="statusClasses">
            <span class="text-xs">✓</span>
          </div>
        </div>
      </div>
      
      <!-- Avatar for sent messages -->
      <app-avatar
        *ngIf="isOwnMessage"
        src=""
        [alt]="message.senderName"
        [size]="'sm'"
        class="flex-shrink-0"
      ></app-avatar>
    </div>
  `,
  styles: []
})
export class MessageBubbleComponent {
  @Input() message!: ChatMessage;
  @Input() currentUserId: string = '';
  @Input() showAvatar: boolean = true;

  get isOwnMessage(): boolean {
    return this.message.senderId === this.currentUserId;
  }

  get messageContainerClasses(): string {
    const baseClasses = 'flex items-end space-x-2 mb-4';
    return this.isOwnMessage 
      ? `${baseClasses} flex-row-reverse space-x-reverse`
      : baseClasses;
  }

  get messageBubbleClasses(): string {
    const baseClasses = 'max-w-xs lg:max-w-md px-4 py-2 rounded-lg';
    return this.isOwnMessage
      ? `${baseClasses} bg-blue-500 text-white rounded-br-none`
      : `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none`;
  }

  get timestampClasses(): string {
    const baseClasses = 'text-xs mt-1';
    return this.isOwnMessage
      ? `${baseClasses} text-blue-100`
      : `${baseClasses} text-gray-500 dark:text-gray-400`;
  }

  get statusClasses(): string {
    return 'text-xs text-gray-500 dark:text-gray-400';
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If message is from today, show only time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // If message is from this week, show day and time
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // Otherwise show full date and time
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  getFileName(url: string): string {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      return parts[parts.length - 1] || 'archivo';
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'archivo';
    }
  }
}
