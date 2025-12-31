import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ChatUser } from '../../../domain/models/chat.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        (click)="toggleProfile()"
        class="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary transition-colors duration-200"
      >
        <div class="w-8 h-8 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-medium">
          {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <!-- Profile dropdown -->
      <div *ngIf="showProfile" class="absolute top-full right-0 mt-2 w-64 bg-primary rounded-lg shadow-lg border border-gray-200 z-50">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-medium text-lg">
              {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{{ user?.name || 'Unknown User' }}</h3>
              <p class="text-sm text-gray-500">{{ user?.email || 'No email' }}</p>
              <span class="inline-block px-2 py-1 text-xs font-medium rounded-full capitalize mt-1" [style.backgroundColor]="'var(--primary-color-light)'" [style.color]="'var(--primary-color)'">
                {{ user?.role || 'user' }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-2">
          <!-- Theme settings -->
          <div class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Appearance</h4>
            <div class="space-y-1">
              <button
                (click)="toggleTheme('light')"
                [style.backgroundColor]="currentTheme === 'light' ? 'var(--primary-color-light)' : null"
                [style.color]="currentTheme === 'light' ? 'var(--primary-color)' : null"
                class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <span>Light</span>
              </button>
              <button
                (click)="toggleTheme('dark')"
                [style.backgroundColor]="currentTheme === 'dark' ? 'var(--primary-color-light)' : null"
                [style.color]="currentTheme === 'dark' ? 'var(--primary-color)' : null"
                class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
                <span>Dark</span>
              </button>
            </div>
          </div>

          <!-- Color customization -->
          <div class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Primary Color</h4>
            <div class="flex space-x-2">
              <button
                *ngFor="let color of colorOptions"
                (click)="selectPrimaryColor(color.value)"
                [class.ring-2]="currentPrimaryColor === color.value"
                [class.ring-[var(--primary-color)]]="currentPrimaryColor === color.value"
                [style.background-color]="color.value"
                class="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform duration-200"
                [title]="color.name"
              ></button>
            </div>
          </div>

          <!-- Language settings -->
          <div class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Language</h4>
            <select
              (change)="onLanguageChange($event)"
              [disabled]="!isTranslationSupported"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option *ngFor="let lang of availableLanguages" [value]="lang.code" [selected]="currentLanguage === lang.code">
                {{ lang.name }}
              </option>
            </select>
            <div *ngIf="!isTranslationSupported" class="text-xs text-orange-600 mt-1">
              Translation not available in this browser
            </div>
          </div>

          <!-- Status settings -->
          <div class="mb-3">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Status</h4>
            <div class="space-y-1">
              <button
                *ngFor="let status of statusOptions"
                (click)="setUserStatus(status.value)"
                [class.bg-green-50]="currentStatus === 'online' && status.value === 'online'"
                [class.text-green-700]="currentStatus === 'online' && status.value === 'online'"
                [class.bg-yellow-50]="currentStatus === 'away' && status.value === 'away'"
                [class.text-yellow-700]="currentStatus === 'away' && status.value === 'away'"
                [class.bg-red-50]="currentStatus === 'busy' && status.value === 'busy'"
                [class.text-red-700]="currentStatus === 'busy' && status.value === 'busy'"
                class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  [class.bg-green-500]="status.value === 'online'"
                  [class.bg-yellow-500]="status.value === 'away'"
                  [class.bg-red-500]="status.value === 'busy'"
                ></div>
                <span>{{ status.label }}</span>
              </button>
            </div>
          </div>

          <!-- Logout -->
          <div class="border-t border-gray-200 pt-2">
            <button
              (click)="logout()"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UserProfileComponent implements OnInit {
  @Input() user: ChatUser | null = null;
  @Input() currentTheme: string = 'light';
  @Input() currentPrimaryColor: string = '#3B82F6';
  @Input() currentLanguage: string = 'es';
  @Input() currentStatus: string = 'online';
  @Input() isTranslationSupported: boolean = true;
  
  @Output() themeChange = new EventEmitter<string>();
  @Output() primaryColorChange = new EventEmitter<string>();
  @Output() languageChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();

  showProfile: boolean = false;
  
  availableLanguages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' }
  ];

  colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' }
  ];

  statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'busy', label: 'Busy' }
  ];

  ngOnInit(): void {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-user-profile')) {
      this.showProfile = false;
    }
  }

  toggleTheme(theme: string): void {
    this.currentTheme = theme;
    this.themeChange.emit(theme);
  }

  selectPrimaryColor(color: string): void {
    this.currentPrimaryColor = color;
    this.primaryColorChange.emit(color);
  }

  onLanguageChange(event: Event): void {
    console.log(`[UserProfile] Language change triggered`);
    const select = event.target as HTMLSelectElement;
    console.log(`[UserProfile] Selected language: ${select.value}`);
    this.currentLanguage = select.value;
    this.languageChange.emit(select.value);
  }

  setUserStatus(status: string): void {
    this.currentStatus = status;
    this.statusChange.emit(status);
  }

  logout(): void {
    this.logout.emit();
    this.showProfile = false;
  }
}
