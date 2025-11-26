import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../../domain/models/chat.model';

@Component({
  selector: 'app-contact-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-item.component.html',
  styles: []
})
export class ContactItemComponent {
  @Input() conversation!: Conversation;
  @Input() isSelected: boolean = false;
  @Input() currentUserId: string = '';
  
  @Output() contactClick = new EventEmitter<Conversation>();

  get contactItemClasses(): string {
    const baseClasses = 'flex items-center space-x-3 py-2.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200';
    return this.isSelected 
      ? `${baseClasses} bg-blue-50 dark:bg-gray-800 border-r-2 border-blue-500`
      : baseClasses;
  }

  get nameClasses(): string {
    const baseClasses = 'text-sm font-medium truncate leading-tight';
    return (this.conversation.unreadCount || 0) > 0
      ? `${baseClasses} text-gray-900 dark:text-gray-100 font-semibold`
      : `${baseClasses} text-gray-900 dark:text-gray-100`;
  }

  get lastMessageClasses(): string {
    const baseClasses = 'text-xs truncate leading-snug';
    return (this.conversation.unreadCount || 0) > 0
      ? `${baseClasses} text-gray-700 dark:text-gray-300 font-medium`
      : `${baseClasses} text-gray-500 dark:text-gray-400`;
  }

  onContactClick(): void {
    this.contactClick.emit(this.conversation);
  }

  getOtherParticipant(): any {
    if (!this.conversation.participants || this.conversation.participants.length === 0) {
      return null;
    }
    
    // If it's a private conversation, return the other participant
    if (this.conversation.type === 'private' && this.conversation.participants.length === 2) {
      return this.conversation.participants.find(p => p.id !== this.currentUserId);
    }
    
    // For group conversations or if we can't determine, return the first participant
    return this.conversation.participants[0];
  }

  getOtherParticipantName(): string {
    const other = this.getOtherParticipant();
    return other ? other.name : 'User';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  formatLastMessageTime(timestamp?: Date): string {
    if (!timestamp) return '';
    
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

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // This week
    const daysDiff = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Older
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
