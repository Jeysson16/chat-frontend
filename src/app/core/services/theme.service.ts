import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface ThemeConfig {
  theme: 'light' | 'dark';
  primaryColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';
  private currentPrimaryColor: string = '#3B82F6';

  constructor(private storageService: StorageService) {
    this.loadTheme();
  }

  private loadTheme(): void {
    const config = this.storageService.getChatConfig();
    this.currentTheme = config.theme;
    this.currentPrimaryColor = config.primaryColor;
    this.applyTheme();
  }

  private applyTheme(): void {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply theme class to html element for better scoping
    if (this.currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      body.classList.remove('bg-white', 'text-gray-900');
      body.classList.add('bg-black', 'text-gray-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      body.classList.remove('bg-black', 'text-gray-100');
      body.classList.add('bg-white', 'text-gray-900');
    }
    
    // Apply primary color CSS variables
    root.style.setProperty('--primary-color', this.currentPrimaryColor);
    root.style.setProperty('--primary-color-light', this.lightenColor(this.currentPrimaryColor, 0.2));
    root.style.setProperty('--primary-color-dark', this.darkenColor(this.currentPrimaryColor, 0.2));
    root.style.setProperty('--primary-color-hover', this.darkenColor(this.currentPrimaryColor, 0.1));
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.storageService.setChatConfig({ theme });
    this.applyTheme();
  }

  setPrimaryColor(color: string): void {
    this.currentPrimaryColor = color;
    this.storageService.setChatConfig({ primaryColor: color });
    this.applyTheme();
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  getCurrentPrimaryColor(): string {
    return this.currentPrimaryColor;
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
