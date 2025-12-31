import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ChatMessage } from '../../../domain/models/chat.model';
import { TranslateLabelPipe } from '../../pipes/translate-label.pipe';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, AvatarComponent, TranslateLabelPipe],
  template: `
    <div [ngClass]="messageContainerClasses">
      <!-- Avatar for received messages -->
      <app-avatar
        *ngIf="showAvatar && !isOwnMessage"
        [name]="message.senderName"
        [alt]="message.senderName"
        [size]="'sm'"
        class="flex-shrink-0"
      ></app-avatar>
      
      <div [ngClass]="messageBubbleClasses">
        <div class="break-words" *ngIf="message.type === 'text'">
          {{ message.content }}
        </div>
        <div *ngIf="message.type === 'image'" class="relative max-w-xs lg:max-w-md">
          <img [src]="message.localPreviewUrl || message.content" alt="image" class="rounded-md max-h-64 object-cover" />
          <div *ngIf="message.state && message.state !== 'ready'" class="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
            <div class="flex items-center gap-2 text-xs text-white">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{{ statusLabel | translateLabel }}</span>
            </div>
          </div>
        </div>
        <div *ngIf="message.type === 'audio'" class="flex items-center space-x-2 w-full">
          <div class="flex items-center gap-3 w-full">
            <button (click)="togglePlay()" [disabled]="isDisabled" class="w-8 h-8 rounded-full flex items-center justify-center transition" [ngClass]="isDisabled ? 'bg-white/10' : 'bg-white/20 hover:bg-white/30'">
              <svg *ngIf="!isPlaying" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>
              <svg *ngIf="isPlaying" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
            </button>
            <div class="flex-1 h-2 bg-white/20 rounded">
              <div class="h-2 bg-white/70 rounded" [style.width.%]="playProgress"></div>
            </div>
            <div class="text-xs opacity-80 font-mono">{{ formatSec(currentTime) }} / {{ formatSec(duration) }}</div>
            <audio #player [src]="message.localPreviewUrl || message.content" class="hidden" (loadedmetadata)="onMeta()" (timeupdate)="onTimeUpdate()" (ended)="onEnded()"></audio>
          </div>
          <div *ngIf="message.state && message.state !== 'ready'" class="flex items-center gap-2 mt-2 w-full">
            <div class="flex-1 h-1 bg-white/20 rounded">
              <div class="h-1 bg-white/70 rounded" [style.width.%]="message.uploadProgress || 0"></div>
            </div>
            <div class="text-[10px] opacity-80">{{ statusLabel | translateLabel }}</div>
          </div>
        </div>
        <div *ngIf="message.type === 'file'" class="w-full">
          <a [href]="message.localPreviewUrl || message.content" target="_blank" rel="noopener" class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="underline truncate">{{ getFileName(message.localPreviewUrl || message.content) }}</span>
          </a>
          <div *ngIf="message.state && message.state !== 'ready'" class="mt-2 flex items-center gap-2">
          <div class="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded">
              <div class="h-1 bg-[var(--primary-color)] rounded" [style.width.%]="message.uploadProgress || 0"></div>
          </div>
            <div class="text-[10px] text-gray-700 dark:text-gray-300">{{ statusLabel | translateLabel }}</div>
          </div>
        </div>
        
        <!-- Timestamp -->
        <div [ngClass]="timestampClasses">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
      
      <!-- Avatar for sent messages -->
      <app-avatar
        *ngIf="showAvatar && isOwnMessage"
        [name]="message.senderName"
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
  @Input() currentLanguage: string = 'en';
  @ViewChild('player') player!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;
  playProgress: number = 0;
  duration: number = 0;
  currentTime: number = 0;
  get isDisabled(): boolean { return !!this.message.state && this.message.state !== 'ready'; }
  get statusLabel(): string {
    const s = this.message.state || 'ready';
    if (s === 'pending') return 'Pending';
    if (s === 'uploading') return `${Math.round(this.message.uploadProgress || 0)}%`;
    if (s === 'processing') return 'Processing';
    if (s === 'error') return 'Error';
    return '';
  }

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
      ? `${baseClasses} bg-[var(--primary-color)] text-white rounded-br-none`
      : `${baseClasses} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none`;
  }

  get timestampClasses(): string {
    const baseClasses = 'text-xs mt-1';
    return this.isOwnMessage
      ? `${baseClasses} text-[var(--primary-color-light)]`
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
      return messageDate.toLocaleTimeString(this.currentLanguage || 'en', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // If message is from this week, show day and time
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString(this.currentLanguage || 'en', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    // Otherwise show full date and time
    return messageDate.toLocaleDateString(this.currentLanguage || 'en', {
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
      const qp = u.searchParams.get('filename');
      if (qp) return qp;
      const parts = u.pathname.split('/');
      return parts[parts.length - 1] || 'file';
    } catch {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'file';
    }
  }

  togglePlay(): void {
    const el = this.player?.nativeElement;
    if (!el) return;
    if (!this.isPlaying) {
      el.play().catch(() => {});
      this.isPlaying = true;
    } else {
      el.pause();
      this.isPlaying = false;
    }
  }

  onMeta(): void {
    const el = this.player?.nativeElement;
    if (!el) return;
    this.duration = el.duration || 0;
  }

  onTimeUpdate(): void {
    const el = this.player?.nativeElement;
    if (!el) return;
    this.currentTime = el.currentTime || 0;
    this.duration = el.duration || this.duration;
    this.playProgress = this.duration ? (this.currentTime / this.duration) * 100 : 0;
  }

  onEnded(): void {
    this.isPlaying = false;
    this.playProgress = 100;
  }

  formatSec(v: number): string {
    const total = Math.floor(v || 0);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
