import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatConversation, ChatUser } from '../../../../domain/entities';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ContactItemComponent } from '../../molecules/contact-item/contact-item.component';
import { SearchBarComponent } from '../../molecules/search-bar/search-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    ContactItemComponent,
    AvatarComponent,
    ButtonComponent
  ],
  template: `
    <div class="sidebar">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="user-info">
          <app-avatar
            [avatarUrl]="currentUser?.avatar"
            [name]="currentUser?.name || ''"
            [isOnline]="currentUser?.isOnline || false"
            size="medium"
          ></app-avatar>
          <div class="user-details">
            <div class="user-name">{{ currentUser?.name }}</div>
            <div class="user-status" [class.online]="currentUser?.isOnline">
              {{ currentUser?.isOnline ? 'Online' : 'Offline' }}
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <app-button
            variant="ghost"
            size="small"
            (click)="onNewChatClick()"
            title="New chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </app-button>
          
          <app-button
            variant="ghost"
            size="small"
            (click)="onSettingsClick()"
            title="Settings"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </app-button>
        </div>
      </div>

      <!-- Search -->
      <div class="search-section">
        <app-search-bar
          placeholder="Search contacts..."
          (searchChange)="onSearchChange($event)"
          (searchClear)="onSearchClear()"
        ></app-search-bar>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          [class.active]="activeTab === 'conversations'"
          (click)="setActiveTab('conversations')"
        >
          Conversations
        </button>
        <button
          class="tab"
          [class.active]="activeTab === 'contacts'"
          (click)="setActiveTab('contacts')"
        >
          Contacts
        </button>
      </div>

      <!-- Content -->
      <div class="sidebar-content">
        <!-- Conversations Tab -->
        <div *ngIf="activeTab === 'conversations'" class="conversations-list">
          <div *ngIf="conversations.length === 0" class="empty-state">
            <p>No conversations</p>
            <app-button
              variant="primary"
              size="small"
              (click)="onNewChatClick()"
            >
              Start chat
            </app-button>
          </div>
          
          <app-contact-item
            *ngFor="let conversation of filteredConversations"
            [contact]="getConversationContact(conversation)"
            [isSelected]="selectedConversationId === conversation.id"
            [unreadCount]="conversation.unreadCount || 0"
            (contactClick)="onConversationSelect(conversation)"
          ></app-contact-item>
        </div>

        <!-- Contacts Tab -->
        <div *ngIf="activeTab === 'contacts'" class="contacts-list">
          <div *ngIf="contacts.length === 0" class="empty-state">
            <p>No contacts</p>
          </div>
          
          <app-contact-item
            *ngFor="let contact of filteredContacts"
            [contact]="contact"
            [isSelected]="false"
            (contactClick)="onContactSelect(contact)"
          ></app-contact-item>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 320px;
      height: 100vh;
      background-color: white;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-status {
      font-size: 12px;
      color: #666;
    }

    .user-status.online {
      color: #4caf50;
    }

    .header-actions {
      display: flex;
      gap: 4px;
    }

    .search-section {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
    }

    .tab {
      flex: 1;
      padding: 12px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: #666;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
    }

    .tab:hover {
      background-color: #f5f5f5;
    }

    .tab.active {
      color: #205a89;
      border-bottom-color: #205a89;
      background-color: #f8f9fa;
    }

    .sidebar-content {
      flex: 1;
      overflow-y: auto;
    }

    .conversations-list,
    .contacts-list {
      padding: 8px 0;
    }

    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: #666;
    }

    .empty-state p {
      margin-bottom: 16px;
      font-size: 14px;
    }

    /* Scrollbar styling */
    .sidebar-content::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-content::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .sidebar-content::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .sidebar-content::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() currentUser: ChatUser | null = null;
  @Input() conversations: ChatConversation[] = [];
  @Input() contacts: ChatUser[] = [];
  @Input() selectedConversationId: number | null = null;
  
  @Output() conversationSelect = new EventEmitter<ChatConversation>();
  @Output() contactSelect = new EventEmitter<ChatUser>();
  @Output() newChatClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  activeTab: 'conversations' | 'contacts' = 'conversations';
  searchQuery: string = '';
  filteredConversations: ChatConversation[] = [];
  filteredContacts: ChatUser[] = [];

  ngOnInit(): void {
    this.updateFilteredLists();
  }

  ngOnChanges(): void {
    this.updateFilteredLists();
  }

  setActiveTab(tab: 'conversations' | 'contacts'): void {
    this.activeTab = tab;
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchChange.emit(query);
    this.updateFilteredLists();
  }

  onSearchClear(): void {
    this.searchQuery = '';
    this.updateFilteredLists();
  }

  onConversationSelect(conversation: ChatConversation): void {
    this.conversationSelect.emit(conversation);
  }

  onContactSelect(contact: ChatUser): void {
    this.contactSelect.emit(contact);
  }

  onNewChatClick(): void {
    this.newChatClick.emit();
  }

  onSettingsClick(): void {
    this.settingsClick.emit();
  }

  getConversationContact(conversation: ChatConversation): ChatUser {
    // Para conversaciones individuales, devolver el otro participante
    // Para conversaciones grupales, usar el nombre de la conversación
    if (conversation.type === 'individual' && conversation.participants.length > 0) {
      const otherParticipant = conversation.participants.find(p => p.id !== this.currentUser?.id);
      return otherParticipant || conversation.participants[0];
    }
    
    // For groups, create a temporary ChatUser with the group name
    return {
      id: '0',
      name: conversation.name || 'Grupo',
      email: '',
      isOnline: false,
      isActive: true
    };
  }

  private updateFilteredLists(): void {
    const query = this.searchQuery.toLowerCase();
    
    this.filteredConversations = this.conversations.filter(conversation => {
      const contact = this.getConversationContact(conversation);
      return contact.name.toLowerCase().includes(query) ||
             conversation.name?.toLowerCase().includes(query);
    });

    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query)
    );
  }
}