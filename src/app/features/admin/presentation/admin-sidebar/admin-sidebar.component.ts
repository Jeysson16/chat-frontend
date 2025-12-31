import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <div class="sidebar-container" [ngClass]="getSidebarClasses()">
      <!-- Header with Hamburger Menu -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <button 
            (click)="toggleSidebar()" 
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            [class.rotate-90]="sidebarState.isCollapsed"
            title="Toggle sidebar"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span *ngIf="!sidebarState.isCollapsed" class="text-sm font-semibold text-gray-900">Admin</span>
        </div>
      </div>

      <!-- Navigation Items -->
      <nav class="flex-1 p-4 space-y-2">
        <div *ngFor="let item of navItems" class="relative">
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [class.active]="isActive(item.route)"
            class="group flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer"
            [ngClass]="getNavItemClasses(item)"
            [title]="sidebarState.isCollapsed ? item.title + ' - ' + item.subtitle : ''"
          >
            <div class="nav-icon-container w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                 [ngClass]="getIconClasses(item)"
                 [class.mr-3]="!sidebarState.isCollapsed"
                 [class.mx-auto]="sidebarState.isCollapsed">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="flex-1 transition-all duration-200" *ngIf="!sidebarState.isCollapsed">
              <h3 class="font-medium text-sm transition-all duration-200">{{ item.title }}</h3>
              <p class="text-xs transition-all duration-200 mt-0.5">{{ item.subtitle }}</p>
            </div>
          </a>
        </div>
      </nav>

      <!-- User Profile/Logout -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
             [class.justify-center]="sidebarState.isCollapsed"
             [class.space-x-3]="!sidebarState.isCollapsed"
             title="Administrador - admin@chat.com">
          <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="flex-1 transition-all duration-200" *ngIf="!sidebarState.isCollapsed">
            <p class="text-sm font-medium text-gray-900">Administrador</p>
            <p class="text-xs text-gray-500">admin&#64;chat.com</p>
          </div>
          <button class="p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0" *ngIf="!sidebarState.isCollapsed">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container { 
      height: 100%; 
      background: #fff; 
      border-right: 1px solid #e5e7eb; 
      transition: width 200ms ease, min-width 200ms ease; 
      overflow: hidden; 
    }
    .sidebar-container.expanded { width: 260px; min-width: 260px; }
    .sidebar-container.collapsed { width: 72px; min-width: 72px; }

    .group.active { background: #eef2ff; }
    .group:hover { background: #f3f4f6; }
    .nav-icon-container { border: 1px solid rgba(229,231,235,0.8); }
    .indigo-theme .nav-icon-container { border-color: #e0e7ff; }
    .blue-theme .nav-icon-container { border-color: #dbeafe; }
    .green-theme .nav-icon-container { border-color: #d1fae5; }
    .purple-theme .nav-icon-container { border-color: #ede9fe; }
    .orange-theme .nav-icon-container { border-color: #ffedd5; }
  `]
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<boolean>();
  
  private destroy$ = new Subject<void>();
  currentRoute = '';
  sidebarState: SidebarState = {
    isCollapsed: false,
    isMobile: false
  };

  navItems: NavItem[] = [
    {
      id: 'inicio',
      title: 'Inicio',
      subtitle: 'Panel principal',
      icon: 'dashboard',
      route: '/admin',
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100'
    },
    {
      id: 'aplicaciones',
      title: 'Aplicaciones',
      subtitle: 'Gestionar aplicaciones',
      icon: 'apps',
      route: '/admin/aplicaciones',
      color: 'blue',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'configuraciones',
      title: 'Configuraciones',
      subtitle: 'Configurar aplicaciones',
      icon: 'settings',
      route: '/admin/configuraciones',
      color: 'green',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'usuarios-chat',
      title: 'Usuarios Chat',
      subtitle: 'Gestionar usuarios',
      icon: 'people',
      route: '/admin/usuarios-chat',
      color: 'purple',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },
    {
      id: 'empresas',
      title: 'Empresas',
      subtitle: 'Gestionar empresas',
      icon: 'business',
      route: '/admin/empresas',
      color: 'orange',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadSidebarState();
    this.checkMobile();
    
    // Sync with input property
    this.sidebarState.isCollapsed = this.isCollapsed;
    
    // Listen for window resize events
    window.addEventListener('resize', () => this.checkMobile());

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.checkMobile());
    this.destroy$.next();
    this.destroy$.complete();
  }

  isActive(route: string): boolean {
    if (route === '/admin') {
      return this.currentRoute === '/admin' || this.currentRoute === '/admin/dashboard';
    }
    return this.currentRoute.startsWith(route);
  }

  getNavItemClasses(item: NavItem): string {
    const baseClasses = `${item.color}-theme`;
    return baseClasses;
  }

  getIconClasses(item: NavItem): string {
    return `${item.bgColor} text-${item.color}-600`;
  }

  getIndicatorClasses(item: NavItem): string {
    return `bg-${item.color}-500`;
  }

  toggleSidebar(): void {
    this.sidebarState.isCollapsed = !this.sidebarState.isCollapsed;
    this.sidebarToggle.emit(this.sidebarState.isCollapsed);
    this.saveSidebarState();
  }

  getSidebarClasses(): string {
    return this.sidebarState.isCollapsed ? 'collapsed' : 'expanded';
  }

  private saveSidebarState(): void {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(this.sidebarState.isCollapsed));
  }

  private loadSidebarState(): void {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved) {
      this.sidebarState.isCollapsed = JSON.parse(saved);
    }
  }

  private checkMobile(): void {
    this.sidebarState.isMobile = window.innerWidth < 768;
    if (this.sidebarState.isMobile) {
      this.sidebarState.isCollapsed = true;
    }
  }
}
