import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../infrastructure/services/auth.service';
import { AuthResult } from '../../domain/models/application.model';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
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
          <div *ngIf="signInForm.get('usuario')?.invalid && signInForm.get('usuario')?.touched" class="mt-1 text-sm text-red-600">
            El usuario es requerido
          </div>
        </div>

        <!-- Contraseña -->
        <div>
          <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
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
                <svg *ngIf="!showPassword" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="showPassword" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
          </div>
          <div *ngIf="signInForm.get('contrasena')?.invalid && signInForm.get('contrasena')?.touched" class="mt-1 text-sm text-red-600">
            La contraseña es requerida
          </div>
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
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
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

        <!-- Botón de acceso -->
        <div>
          <button
            type="submit"
            [disabled]="signInForm.invalid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
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