import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../auth/infrastructure/services/auth.service';
import { TranslateLabelDirective } from '../../../chat/presentation/directives/translate-label.directive';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AdminSidebarComponent, MatMenuModule, TranslateLabelDirective],
  template: `
    <div class="flex h-screen bg-gray-50">
      <!-- Sidebar -->
      <app-admin-sidebar 
        class="flex-shrink-0 transition-all duration-300"
        [class.collapsed]="isSidebarCollapsed"
        [isCollapsed]="isSidebarCollapsed"
        (sidebarToggle)="onSidebarToggle($event)"
      ></app-admin-sidebar>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-4 py-2">
          <div class="flex items-center justify-end">
            <div class="flex items-center space-x-3">
              <ng-container *ngIf="isAdmin">
                <button [matMenuTriggerFor]="modeMenu" class="px-2 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs">
                  Cambiar vista
                </button>
                <mat-menu #modeMenu="matMenu" class="admin-menu">
                  <button mat-menu-item (click)="switchTo('admin')">
                    <span>Administración</span>
                  </button>
                  <button mat-menu-item (click)="switchTo('chat')">
                    <span>Chat</span>
                  </button>
                </mat-menu>
              </ng-container>
              <div class="flex items-center space-x-3">
                <button [matMenuTriggerFor]="userMenu" class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                  {{ userInitials }}
                </button>
              </div>
              <mat-menu #userMenu="matMenu" class="admin-menu">
                <button mat-menu-item (click)="goToProfile()">
                  <span class="mat-mdc-menu-item-text" translateLabel="Perfil"></span>
                </button>
                <button mat-menu-item (click)="logout()">
                  <span class="mat-mdc-menu-item-text" translateLabel="Salir"></span>
                </button>
              </mat-menu>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .flex-1 {
      flex: 1;
    }
    
    .overflow-auto {
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb #f9fafb;
    }
    
    .overflow-auto::-webkit-scrollbar {
      width: 6px;
    }
    
    .overflow-auto::-webkit-scrollbar-track {
      background: #f9fafb;
    }
    
    .overflow-auto::-webkit-scrollbar-thumb {
      background-color: #e5e7eb;
      border-radius: 3px;
    }
    
    .overflow-auto::-webkit-scrollbar-thumb:hover {
      background-color: #d1d5db;
    }

    :host { display: block; }

    /* Admin mat-menu styling */
    ::ng-deep .mat-mdc-menu-panel { 
      background: #ffffff !important; 
      border-radius: 12px; 
      box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
      padding: 6px 0 !important;
    }
    ::ng-deep .mat-mdc-menu-item { min-height: 32px !important; }
    ::ng-deep .mat-mdc-menu-item .mat-mdc-menu-item-text { 
      font-size: 13px !important; 
      color: #374151 !important; 
    }
    ::ng-deep .mat-mdc-menu-item:hover { background: #f3f4f6 !important; }
  `]
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isAdmin = false;
  userInitials = 'A';
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        this.currentUser = user;
        this.isAdmin = ['ADMIN','SUPER_ADMIN','administrator','admin'].includes((user?.role || user?.cUsuariosChatRol || '').toUpperCase());
        const name = user?.name || user?.cUsuariosNombre || '';
        this.userInitials = name ? name.split(' ').map((w: string) => w[0]).join('').substring(0,2).toUpperCase() : 'A';
      }
    } catch {}
  }

  onSidebarToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  switchTo(mode: 'admin'|'chat'): void {
    if (mode === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/chat']);
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
