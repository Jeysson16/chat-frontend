import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatUser, Conversation } from '../../../domain/models/chat.model';
import { TranslateLabelDirective } from '../../../presentation/directives/translate-label.directive';
import { ContactItemComponent } from '../contact-item/contact-item.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, ContactItemComponent, TranslateLabelDirective, MatIconModule],
  template: `
    <div class="chat-sidebar bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col h-full" [ngClass]="{ 'w-16': compact, 'w-80': !compact }">
      <div *ngIf="compact" class="flex-auto">
        <div *ngFor="let conversation of conversations" (click)="onConversationSelect(conversation)" class="flex cursor-pointer items-center px-4 py-3 hover:bg-secondary">
          <div class="relative flex h-8 w-8 items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color-light)] to-[var(--primary-color)] flex items-center justify-center text-white text-sm">{{ getInitials(getDisplayName(conversation)) }}</div>
          </div>
        </div>
      </div>
      <div *ngIf="!compact" class="flex-1 overflow-y-auto">
        <div *ngIf="isLoading" class="p-4">
          <div class="animate-pulse space-y-4">
            <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-3 p-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="!isLoading && !isSearchMode && conversations.length === 0 && !searchQuery" class="p-8 text-center">
          <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon>chat</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2" translateLabel="No conversations yet"></h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6" translateLabel="Start a new conversation to get started"></p>
          <button (click)="onNewChat()" class="px-6 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded-lg transition-colors duration-200" translateLabel="Start chatting"></button>
        </div>
        <div *ngIf="!isLoading && !isSearchMode && conversations.length === 0 && searchQuery" class="p-8 text-center">
          <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon>search</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2" translateLabel="No results found"></h3>
          <p class="text-gray-500" translateLabel="Try searching with different keywords"></p>
        </div>
        <div *ngIf="!isLoading && !isSearchMode && conversations.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
          <app-contact-item *ngFor="let conversation of conversations" [conversation]="conversation" [isSelected]="selectedConversationId === conversation.id" [currentUserId]="currentUserId" (contactClick)="onConversationSelect($event)"></app-contact-item>
        </div>
        <div *ngIf="!isLoading && isSearchMode && !searchQuery" class="p-8 text-center">
          <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon>search</mat-icon>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2" translateLabel="Type to search users"></h3>
          <p class="text-gray-500" translateLabel="Start typing a name or email"></p>
        </div>
        <div *ngIf="!isLoading && isSearchMode && searchQuery" class="divide-y divide-gray-100">
          <div *ngFor="let contact of contacts" (click)="onContactSelect(contact)" class="flex items-center space-x-2 p-2 hover:bg-secondary cursor-pointer transition-colors duration-200">
            <div class="relative">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary-color-light)] to-[var(--primary-color)] flex items-center justify-center text-white font-medium text-xs">{{ getInitials(contact.name) }}</div>
              <div *ngIf="contact.isOnline" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0 space-y-1">
                <p class="text-sm font-medium text-gray-900 truncate">{{ contact.name }}</p>
              <p class="text-[11px] text-gray-500 truncate leading-tight">{{ contact.email || 'No email' }}</p>
            </div>
          </div>
          <div *ngIf="contacts.length === 0 && searchQuery" class="p-8 text-center">
            <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon>search</mat-icon>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2" translateLabel="No contacts found"></h3>
            <p class="text-gray-500" translateLabel="Try searching with different keywords"></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ChatSidebarComponent {
  @Input() compact: boolean = false;
  @Input() conversations: Conversation[] = [];
  @Input() selectedConversationId: string | null = null;
  @Input() isLoading: boolean = false;
  @Input() isSearchMode: boolean = false;
  @Input() contacts: ChatUser[] = [];
  @Input() currentUserId: string = '';
  @Input() searchQuery: string = '';
  @Input() isTranslationEnabled: boolean = false;
  @Input() currentLanguage: string = 'es';
  
  @Output() conversationSelect = new EventEmitter<Conversation>();
  @Output() newChat = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() contactSelect = new EventEmitter<ChatUser>();

  onConversationSelect(conversation: Conversation): void {
    this.conversationSelect.emit(conversation);
  }

  onNewChat(): void {
    this.newChat.emit();
  }

  onContactSelect(contact: ChatUser): void {
    this.contactSelect.emit(contact);
  }

  getDisplayName(conversation: Conversation): string {
    return conversation.name || conversation.participants?.[0]?.name || 'Unknown';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
