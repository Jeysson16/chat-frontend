import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthResult } from '../../domain/models/application.model';
import { AuthService } from '../../infrastructure/services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatIconModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Panel Derecho - Formulario -->
      <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          <!-- Logo pequeño arriba -->
          <div class="text-center mb-8">
            <img src="/images/logo/logo.svg" alt="SICOM Logo" class="h-12 w-auto mx-auto mb-6">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">SICOM - INICIO DE SESIÓN</h2>
            <p class="text-gray-600">Accede a tu cuenta corporativa</p>
          </div>

      <!-- Formulario -->
      <form [formGroup]="signInForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Usuario -->
        <div>
          <label for="usuario" class="block text-sm font-medium text-gray-700 mb-2">
            Usuario
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="h-5 w-5 text-gray-400">person</mat-icon>
            </div>
            <input
              id="usuario"
              name="usuario"
              type="text"
              formControlName="usuario"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              [class.border-red-500]="signInForm.get('usuario')?.invalid && signInForm.get('usuario')?.touched"
              placeholder="Ingresa tu usuario"
            />
          </div>
          @if (signInForm.get('usuario')?.invalid && signInForm.get('usuario')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              El usuario es requerido
            </div>
          }
        </div>

        <!-- Contraseña -->
        <div>
          <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="h-5 w-5 text-gray-400">lock</mat-icon>
            </div>
            <input
              id="contrasena"
              name="contrasena"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="contrasena"
              class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              [class.border-red-500]="signInForm.get('contrasena')?.invalid && signInForm.get('contrasena')?.touched"
              placeholder="Ingresa tu contraseña"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                @if (!showPassword) {
                  <mat-icon class="h-5 w-5 mt-1">visibility</mat-icon>
                } @else {
                  <mat-icon class="h-5 w-5 mt-1">visibility_off</mat-icon>
                }
              </button>
            </div>
          </div>
          @if (signInForm.get('contrasena')?.invalid && signInForm.get('contrasena')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              La contraseña es requerida
            </div>
          }
        </div>

        <!-- Recordar contraseña -->
        <div class="flex items-center">
          <input
            id="recordar"
            name="recordar"
            type="checkbox"
            formControlName="recordar"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="recordar" class="ml-2 block text-sm text-gray-900">
            Recordar contraseña
          </label>
        </div>

        <!-- Error message -->
        @if (errorMessage) {
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Botón de acceso -->
        <div>
          <button
            type="submit"
            [disabled]="signInForm.invalid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            @if (isLoading) {
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            }
            {{ isLoading ? 'Accediendo...' : 'Acceder' }}
          </button>
        </div>

        <!-- Link de registro -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta?
            <a routerLink="/auth/sign-up" class="font-medium text-primary hover:text-primary-600 transition-colors duration-200">
              Regístrate aquí
            </a>
          </p>
        </div>
      </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SignInComponent implements OnInit, OnDestroy {
  signInForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.signInForm = this.formBuilder.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
      recordar: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { usuario, contrasena, recordar } = this.signInForm.value;

      console.log('Starting login process with user:', usuario);

      this.authService.login({ userCode: usuario, password: contrasena }, recordar)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AuthResult) => {
            console.log('Login response received:', response);
            this.isLoading = false;
            // Redirect based on user role after successful login
            this.handlePostLoginRedirection(response);
          },
          error: (error: any) => {
            console.error('Login error:', error);
            this.isLoading = false;
            this.errorMessage = this.getErrorMessage(error);
          }
        });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.signInForm.controls).forEach(key => {
        this.signInForm.get(key)?.markAsTouched();
      });
    }
  }

  private handlePostLoginRedirection(response: AuthResult): void {
    console.log('handlePostLoginRedirection called with:', response);
    
    if (response.success && response.user) {
      const userRole = response.user.role; // Use the role as-is (already mapped by adapter)
      console.log('User role:', userRole);
      console.log('Full user object:', response.user);
      
      // Check if user has admin privileges
      if (userRole === 'admin') {
        console.log('Redirecting to role selection for admin user');
        // Redirect to role selection for admin users
        this.router.navigate(['/auth/role-selection']).then(navResult => {
          console.log('Navigation to role-selection result:', navResult);
        }).catch(navError => {
          console.error('Navigation error to role-selection:', navError);
        });
      } else {
        console.log('Redirecting to chat for normal user');
        // Redirect normal users directly to chat
        this.router.navigate(['/chat']).then(navResult => {
          console.log('Navigation to chat result:', navResult);
        }).catch(navError => {
          console.error('Navigation error to chat:', navError);
        });
      }
    } else {
      console.log('No user data, redirecting to home');
      // Fallback to home if no user data
      this.router.navigate(['/']).then(navResult => {
        console.log('Navigation to home result:', navResult);
      }).catch(navError => {
        console.error('Navigation error to home:', navError);
      });
    }
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.message) {
      return error.message;
    }

    return 'Error al iniciar sesión. Por favor, verifica tus credenciales.';
  }
}
