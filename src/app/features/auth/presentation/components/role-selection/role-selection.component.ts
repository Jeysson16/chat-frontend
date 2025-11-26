import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { User } from '../../../domain/models/application.model';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Selecciona tu modo de acceso
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600" *ngIf="currentUser">
            Bienvenido, <span class="font-medium">{{ currentUser.name }}</span>
          </p>
          <p class="mt-1 text-center text-xs text-gray-500">
            Tienes permisos de administrador. ¿Cómo deseas continuar?
          </p>
        </div>

        <div class="mt-8 space-y-4">
          <!-- Opción Administrador -->
          <div class="relative">
            <button
              type="button"
              (click)="selectAdminMode()"
              class="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105">
              <div class="flex items-center space-x-3">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
                <span>Continuar como Administrador</span>
              </div>
            </button>
            <p class="mt-2 text-xs text-gray-500 text-center">
              Acceso completo a funciones administrativas
            </p>
          </div>

          <!-- Opción Usuario Normal -->
          <div class="relative">
            <button
              type="button"
              (click)="selectUserMode()"
              class="group relative w-full flex justify-center items-center py-4 px-6 border-2 border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200">
              <div class="flex items-center space-x-3">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>Continuar como Usuario Normal</span>
              </div>
            </button>
            <p class="mt-2 text-xs text-gray-500 text-center">
              Acceso al chat y funciones básicas
            </p>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400">
            Puedes cambiar de modo en cualquier momento desde tu perfil
          </p>
        </div>

        <!-- Logout option -->
        <div class="mt-4 text-center">
          <button
            type="button"
            (click)="logout()"
            class="text-sm text-gray-500 hover:text-gray-700 underline">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RoleSelectionComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          // Verificar que el usuario tenga permisos de administrador
          if (user && !this.isAdminUser(user)) {
            // Si no es admin, redirigir directamente al chat
            this.router.navigate(['/chat']);
          }
        },
        error: (error) => {
          console.error('Error loading current user:', error);
          this.router.navigate(['/auth/sign-in']);
        }
      });
  }

  private isAdminUser(user: User): boolean {
    const adminRoles = ['admin', 'SUPER_ADMIN', 'ADMIN'];
    return adminRoles.includes(user.role);
  }

  selectAdminMode(): void {
    // Redirigir al dashboard de administrador
    this.router.navigate(['/admin/dashboard']);
  }

  selectUserMode(): void {
    // Redirigir al chat como usuario normal
    this.router.navigate(['/chat']);
  }

  logout(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/sign-in']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          // Incluso si hay error, redirigir al login
          this.router.navigate(['/auth/sign-in']);
        }
      });
  }
}