import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { ChatMessage, ChatUser } from '../../../domain/models/chat.model';
import { TranslationService } from '../../../infrastructure/services/translation.service';
import { TranslateLabelDirective } from '../../directives/translate-label.directive';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ChatHeaderComponent, MessageListComponent, MessageInputComponent, TranslateLabelDirective],
  template: `
    <div class="chat-window flex flex-col h-screen bg-white dark:bg-black">
      <!-- Original Clean Empty State -->
      <div 
        *ngIf="!selectedUser" 
        class="flex-1 flex flex-col items-center justify-center bg-white dark:bg-black"
      >
        <div class="text-center max-w-md mx-auto px-6">
          <!-- Simple chat icon -->
          <div class="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
            <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-semibold text-primary mb-3" translateLabel="Welcome to Chat"></h2>
          <p class="text-secondary text-base mb-6" translateLabel="Connect with your team and start meaningful conversations. Select a conversation from the sidebar or create a new one to start.">
          </p>
          
          <!-- Simple CTA -->
          <div class="space-y-3">
            <button
              (click)="onNewChat()"
              class="text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              [style.background-color]="currentPrimaryColor"
              translateLabel="Start New Conversation"
            >
            </button>
            
            <div class="flex items-center justify-center text-xs text-tertiary">
              <span translateLabel="Tip: Use the + button on the sidebar to start chatting"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Clean Chat interface when conversation is selected -->
      <ng-container *ngIf="selectedUser">
        <!-- Simple Chat header -->
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <app-chat-header
          [user]="selectedUser"
          [isTranslationEnabled]="isTranslationEnabled"
          [currentLanguage]="currentLanguage"
          (phoneCall)="onPhoneCall()"
          (videoCall)="onVideoCall()"
          (moreOptions)="onMoreOptions()"
          (translationToggle)="onTranslationToggle($event)"
        ></app-chat-header>
        </div>

        <!-- Messages area -->
        <app-message-list
          class="flex-1 min-h-0"
          [messages]="messages"
          [currentUserId]="currentUserId"
          [isLoading]="isLoadingMessages"
          [isLoadingOlder]="isLoadingOlderMessages"
          [isTyping]="typingUsers.length > 0"
          [typingUsers]="typingUsers"
          [hasMoreMessages]="hasMoreMessages"
          [isTranslationEnabled]="isTranslationEnabled"
          [currentLanguage]="currentLanguage"
          (loadOlderMessages)="onLoadOlderMessages()"
          (messageVisible)="onMessageVisible($event)"
        ></app-message-list>

        <!-- Message input -->
        <app-message-input
          [disabled]="isSendingMessage || !selectedUser"
          [isSending]="isSendingMessage"
          [placeholder]="getInputPlaceholder()"
          (sendMessage)="onSendMessage($event)"
          (attachmentClick)="onAttachmentClick()"
          (attachmentSelected)="onAttachmentSelected($event)"
          (emojiClick)="onEmojiClick()"
          (voiceRecordingStart)="onVoiceRecordingStart()"
          (voiceRecordingStop)="onVoiceRecordingStop()"
          (inputFocus)="onInputFocus()"
          (inputBlur)="onInputBlur()"
          (typing)="onTypingChange($event)"
        ></app-message-input>
      </ng-container>

      <!-- Simple Connection status indicator -->
      <div 
        *ngIf="!isConnected" 
        class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded text-sm z-50"
        translateLabel="Reconnecting..."
      >
      </div>
    </div>
  `
})
export class ChatWindowComponent implements OnChanges {
  private translationService = inject(TranslationService);
  
  @Input() selectedUser: ChatUser | null = null;
  @Input() messages: ChatMessage[] = [];
  @Input() currentUserId: string = '';
  @Input() isLoadingMessages: boolean = false;
  @Input() isLoadingOlderMessages: boolean = false;
  @Input() isSendingMessage: boolean = false;
  @Input() isTyping: boolean = false;
  @Input() typingUsers: ChatUser[] = [];
  @Input() hasMoreMessages: boolean = true;
  @Input() isConnected: boolean = true;
  @Input() isTranslationEnabled: boolean = false;
  @Input() currentLanguage: string = 'es';
  @Input() currentPrimaryColor: string = '#3B82F6';
  
  inputPlaceholder: string = 'Select a conversation...';
  
  @Output() sendMessage = new EventEmitter<string>();
  @Output() loadOlderMessages = new EventEmitter<void>();
  @Output() attachmentClick = new EventEmitter<void>();
  @Output() emojiClick = new EventEmitter<void>();
  @Output() voiceRecordingStart = new EventEmitter<void>();
  @Output() voiceRecordingStop = new EventEmitter<void>();
  @Output() phoneCall = new EventEmitter<void>();
  @Output() videoCall = new EventEmitter<void>();
  @Output() moreOptions = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() typingChange = new EventEmitter<boolean>();
  @Output() messageVisible = new EventEmitter<ChatMessage>();
  @Output() translationToggle = new EventEmitter<boolean>();
  @Output() languageChange = new EventEmitter<string>();
  @Output() newChat = new EventEmitter<void>();
  @Output() attachmentSelected = new EventEmitter<File>();

  ngOnChanges(changes: SimpleChanges): void {
    // Reset typing state when user changes
    if (changes['selectedUser'] && changes['selectedUser'].currentValue !== changes['selectedUser'].previousValue) {
      this.isTyping = false;
    }
    
    // Update placeholder when language or translation settings change
    if ((changes['currentLanguage'] || changes['isTranslationEnabled'] || changes['selectedUser']) && this.isTranslationEnabled) {
      this.updateInputPlaceholder();
    }
  }

  onSendMessage(message: string): void {
    if (message.trim() && this.selectedUser) {
      this.sendMessage.emit(message);
    }
  }

  onLoadOlderMessages(): void {
    this.loadOlderMessages.emit();
  }

  onAttachmentClick(): void {
    this.attachmentClick.emit();
  }

  onAttachmentSelected(file: File): void {
    this.attachmentSelected.emit(file);
  }

  onEmojiClick(): void {
    this.emojiClick.emit();
  }

  onVoiceRecordingStart(): void {
    this.voiceRecordingStart.emit();
  }

  onVoiceRecordingStop(): void {
    this.voiceRecordingStop.emit();
  }

  onPhoneCall(): void {
    this.phoneCall.emit();
  }

  onVideoCall(): void {
    this.videoCall.emit();
  }

  onMoreOptions(): void {
    this.moreOptions.emit();
  }

  onInputFocus(): void {
    this.inputFocus.emit();
  }

  onInputBlur(): void {
    this.inputBlur.emit();
  }

  onTypingChange(isTyping: boolean): void {
    this.typingChange.emit(isTyping);
  }

  onMessageVisible(message: ChatMessage): void {
    this.messageVisible.emit(message);
  }

  onNewChat(): void {
    this.newChat.emit();
  }

  onTranslationToggle(enabled: boolean): void {
    console.log(`[ChatWindow] Translation toggle: ${enabled}`);
    this.translationToggle.emit(enabled);
  }

  private async updateInputPlaceholder(): Promise<void> {
    console.log(`[ChatWindow] Updating input placeholder, translation enabled: ${this.isTranslationEnabled}`);
    
    if (!this.selectedUser) {
      this.inputPlaceholder = 'Select a conversation...';
      return;
    }
    
    if (!this.selectedUser.isOnline) {
      const offlineText = `${this.selectedUser.name} is offline...`;
      if (this.isTranslationEnabled) {
        try {
          this.inputPlaceholder = await this.translationService.translateMessage(offlineText, this.currentLanguage);
          console.log(`[ChatWindow] Translated offline placeholder: "${this.inputPlaceholder}"`);
        } catch (error) {
          console.error(`[ChatWindow] Failed to translate offline placeholder:`, error);
          this.inputPlaceholder = offlineText;
        }
      } else {
        this.inputPlaceholder = offlineText;
      }
    } else {
      const typingText = `Type a message to ${this.selectedUser.name}...`;
      if (this.isTranslationEnabled) {
        try {
          this.inputPlaceholder = await this.translationService.translateMessage(typingText, this.currentLanguage);
          console.log(`[ChatWindow] Translated typing placeholder: "${this.inputPlaceholder}"`);
        } catch (error) {
          console.error(`[ChatWindow] Failed to translate typing placeholder:`, error);
          this.inputPlaceholder = typingText;
        }
      } else {
        this.inputPlaceholder = typingText;
      }
    }
  }

  getInputPlaceholder(): string {
    return this.inputPlaceholder;
  }
}
