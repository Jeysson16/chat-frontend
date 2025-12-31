import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChatMessage, ChatUser } from '../../../domain/models/chat.model';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { TranslateLabelPipe } from '../../pipes/translate-label.pipe';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MessageBubbleComponent, TranslateLabelPipe],
  template: `
    <div 
      #messageContainer
      class="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-black"
      (scroll)="onScroll($event)"
    >
      <!-- Loading indicator for loading older messages -->
      @if (isLoadingOlder) {
        <div class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      }

      <!-- Empty state -->
      @if (messages.length === 0 && !isLoading) {
      <div 
        class="flex flex-col items-center justify-center h-full"
      >
        <svg class="w-16 h-16 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300" translateLabel="Start the conversation by sending the first message"></p>
      </div>
      }

      <!-- Loading state -->
      @if (isLoading) {
        <div 
          class="flex justify-center items-center h-full"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      }

      <!-- Messages -->
      @if (!isLoading) {
      <div class="space-y-4">
        <!-- Date separator -->
        @for (message of messages; track trackByMessageId($index, message)) {
          <!-- Show date separator if this is the first message of a new day -->
          @if (shouldShowDateSeparator(message, $index)) {
            <div 
              class="flex justify-center my-6"
            >
              <span class="bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                {{ formatDateSeparator(message.timestamp) | translateLabel }}
              </span>
            </div>
          }

          <!-- Message bubble -->
          <app-message-bubble
            [message]="message"
            [currentUserId]="currentUserId"
            [showAvatar]="shouldShowAvatar(message, $index)"
            [currentLanguage]="currentLanguage"
          ></app-message-bubble>
        }
      </div>
      }

      <!-- Typing indicator -->
      @if (typingUsers.length > 0) {
      <div 
        class="flex items-center space-x-2 px-4 py-2"
      >
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <span class="text-sm text-gray-500">
          @if (typingUsers.length === 1) {
            {{ typingUsers[0].name }} is typing...
          }
          @else if (typingUsers.length > 1) {
            {{ typingUsers.length }} people are typing...
          }
        </span>
      </div>
      }

      <!-- Scroll to bottom button -->
      @if (showScrollToBottom) {
      <button
        (click)="scrollToBottom()"
        class="fixed bottom-20 right-6 bg-[var(--primary-color)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--primary-color-hover)] transition-colors z-10"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </button>
      }
    </div>
  `,
  styles: []
})
export class MessageListComponent implements OnChanges, AfterViewChecked {
  @ViewChild('messageContainer') messageContainer!: ElementRef<HTMLDivElement>;
  
  @Input() messages: ChatMessage[] = [];
  @Input() currentUserId: string = '';
  @Input() isLoading: boolean = false;
  @Input() isLoadingOlder: boolean = false;
  @Input() isTyping: boolean = false;
  @Input() typingUserName: string = '';
  @Input() typingUsers: ChatUser[] = [];
  @Input() hasMoreMessages: boolean = true;
  @Input() isTranslationEnabled: boolean = false;
  @Input() currentLanguage: string = 'es';
  
  @Output() loadOlderMessages = new EventEmitter<void>();
  @Output() messageVisible = new EventEmitter<ChatMessage>();

  showScrollToBottom: boolean = false;
  private shouldScrollToBottom: boolean = true;
  private lastMessageCount: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && this.messages) {
      const currentMessageCount = this.messages.length;
      
      // If new messages were added, scroll to bottom
      if (currentMessageCount > this.lastMessageCount) {
        this.shouldScrollToBottom = true;
      }
      
      this.lastMessageCount = currentMessageCount;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    
    // Check if user scrolled to top (load older messages)
    if (scrollTop === 0 && this.hasMoreMessages && !this.isLoadingOlder) {
      this.loadOlderMessages.emit();
    }
    
    // Show/hide scroll to bottom button
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    this.showScrollToBottom = !isNearBottom && this.messages.length > 0;
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      const element = this.messageContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    const id = message.id ? message.id.toString() : '';
    if (id && id !== '0') return id;
    const ts = message.timestamp instanceof Date ? message.timestamp.getTime() : new Date(message.timestamp).getTime();
    return `${message.senderId}-${ts}-${index}`;
  }

  shouldShowDateSeparator(message: ChatMessage, index: number): boolean {
    if (index === 0) return true;
    
    const currentDate = new Date(message.timestamp).toDateString();
    const previousDate = new Date(this.messages[index - 1].timestamp).toDateString();
    
    return currentDate !== previousDate;
  }

  shouldShowAvatar(message: ChatMessage, index: number): boolean {
    // Always show avatar for the last message from a user
    if (index === this.messages.length - 1) return true;
    
    // Show avatar if next message is from different user
    const nextMessage = this.messages[index + 1];
    if (!nextMessage) return true;
    
    return message.senderId !== nextMessage.senderId;
  }

  formatDateSeparator(timestamp: Date): string {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString(this.currentLanguage || 'en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }
}
