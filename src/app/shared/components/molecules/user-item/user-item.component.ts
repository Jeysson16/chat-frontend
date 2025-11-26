import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';

@Component({
  selector: 'app-user-item',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  template: `
    <div class="user-item" [class.selected]="selected" (click)="onClick()">
      <app-avatar
        [avatarUrl]="user.avatarUrl"
        [name]="user.name"
        [showOnlineStatus]="showOnlineStatus"
        [isOnline]="user.isOnline"
        size="medium"
      ></app-avatar>
      
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div *ngIf="lastMessage" class="last-message">{{ lastMessage }}</div>
        <div *ngIf="user.status && !lastMessage" class="user-status">{{ user.status }}</div>
      </div>
      
      <div class="user-meta">
        <div *ngIf="timestamp" class="timestamp">{{ timestamp }}</div>
        <div *ngIf="unreadCount && unreadCount > 0" class="unread-badge">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
        <div *ngIf="isPinned" class="pin-indicator">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
            <path fill-rule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      border-radius: 8px;
      margin: 2px 8px;
    }

    .user-item:hover {
      background-color: #f5f5f5;
    }

    .user-item.selected {
      background-color: #e3f2fd;
    }

    .user-info {
      flex: 1;
      margin-left: 12px;
      min-width: 0;
    }

    .user-name {
      font-weight: 500;
      color: #333;
      font-size: 14px;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .last-message {
      color: #666;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-status {
      color: #999;
      font-size: 12px;
      font-style: italic;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      margin-left: 8px;
    }

    .timestamp {
      color: #999;
      font-size: 11px;
      white-space: nowrap;
    }

    .unread-badge {
      background-color: #205a89;
      color: white;
      border-radius: 10px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: 500;
      min-width: 16px;
      text-align: center;
    }

    .pin-indicator {
      font-size: 12px;
      opacity: 0.7;
    }
  `]
})
export class UserItemComponent {
  @Input() user: any = {};
  @Input() lastMessage?: string;
  @Input() timestamp?: string;
  @Input() unreadCount?: number;
  @Input() isPinned: boolean = false;
  @Input() selected: boolean = false;
  @Input() showOnlineStatus: boolean = true;
  
  @Output() click = new EventEmitter<any>();

  onClick(): void {
    this.click.emit(this.user);
  }
}