import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthResult } from '../../domain/models/application.model';
import { AuthService } from '../../infrastructure/services/auth.service';

@Component({
  selector: 'app-sign-up',
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
            <h2 class="text-3xl font-bold text-gray-900 mb-2">SICOM - REGISTRO</h2>
            <p class="text-gray-600">Crea tu cuenta corporativa</p>
          </div>

      <!-- Formulario -->
      <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <!-- Usuario -->
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
            Nombre
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="h-5 w-5 text-gray-400">person</mat-icon>
            </div>
            <input
              id="nombre"
              name="nombre"
              type="text"
              formControlName="nombre"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              [class.border-red-500]="signUpForm.get('nombre')?.invalid && signUpForm.get('nombre')?.touched"
              placeholder="Ingresa tu nombre"
            />
          </div>
          @if (signUpForm.get('nombre')?.invalid && signUpForm.get('nombre')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              @if (signUpForm.get('nombre')?.errors?.['required']) {
                <span>El nombre es requerido</span>
              }
              @if (signUpForm.get('nombre')?.errors?.['minlength']) {
                <span>El nombre debe tener al menos 2 caracteres</span>
              }
            </div>
          }
        </div>
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
              [class.border-red-500]="signUpForm.get('usuario')?.invalid && signUpForm.get('usuario')?.touched"
              placeholder="Ingresa tu usuario"
            />
          </div>
          @if (signUpForm.get('usuario')?.invalid && signUpForm.get('usuario')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              @if (signUpForm.get('usuario')?.errors?.['required']) {
                <span>El usuario es requerido</span>
              }
              @if (signUpForm.get('usuario')?.errors?.['minlength']) {
                <span>El usuario debe tener al menos 3 caracteres</span>
              }
            </div>
          }
        </div>

        <!-- Correo Electrónico -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="h-5 w-5 text-gray-400">mail</mat-icon>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              formControlName="email"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              [class.border-red-500]="signUpForm.get('email')?.invalid && signUpForm.get('email')?.touched"
              placeholder="correo@empresa.com"
            />
          </div>
          @if (signUpForm.get('email')?.invalid && signUpForm.get('email')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              @if (signUpForm.get('email')?.errors?.['required']) {
                <span>El correo electrónico es requerido</span>
              }
              @if (signUpForm.get('email')?.errors?.['email']) {
                <span>Ingresa un correo electrónico válido</span>
              }
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
              [class.border-red-500]="signUpForm.get('contrasena')?.invalid && signUpForm.get('contrasena')?.touched"
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
          @if (signUpForm.get('contrasena')?.invalid && signUpForm.get('contrasena')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              @if (signUpForm.get('contrasena')?.errors?.['required']) {
                <span>La contraseña es requerida</span>
              }
              @if (signUpForm.get('contrasena')?.errors?.['minlength']) {
                <span>La contraseña debe tener al menos 6 caracteres</span>
              }
            </div>
          }
        </div>

        <!-- Confirmar Contraseña -->
        <div>
          <label for="confirmarContrasena" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <mat-icon class="h-5 w-5 text-gray-400">lock</mat-icon>
            </div>
            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              [type]="showConfirmPassword ? 'text' : 'password'"
              formControlName="confirmarContrasena"
              class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              [class.border-red-500]="signUpForm.get('confirmarContrasena')?.invalid && signUpForm.get('confirmarContrasena')?.touched"
              placeholder="Confirma tu contraseña"
            />
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                (click)="toggleConfirmPasswordVisibility()"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                @if (!showConfirmPassword) {
                  <mat-icon class="h-5 w-5 mt-1">visibility</mat-icon>
                } @else {
                  <mat-icon class="h-5 w-5 mt-1">visibility_off</mat-icon>
                }
              </button>
            </div>
          </div>
          @if (signUpForm.get('confirmarContrasena')?.invalid && signUpForm.get('confirmarContrasena')?.touched) {
            <div class="mt-1 text-sm text-red-600">
              @if (signUpForm.get('confirmarContrasena')?.errors?.['required']) {
                <span>Confirma tu contraseña</span>
              }
              @if (signUpForm.get('confirmarContrasena')?.errors?.['passwordMismatch']) {
                <span>Las contraseñas no coinciden</span>
              }
            </div>
          }
        </div>

        <!-- Términos y condiciones -->
        <div class="flex items-center">
          <input
            id="aceptarTerminos"
            name="aceptarTerminos"
            type="checkbox"
            formControlName="aceptarTerminos"
            class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label for="aceptarTerminos" class="ml-2 block text-sm text-gray-900">
            Acepto los términos y condiciones
          </label>
        </div>
        @if (signUpForm.get('aceptarTerminos')?.invalid && signUpForm.get('aceptarTerminos')?.touched) {
          <div class="mt-1 text-sm text-red-600">
            Debes aceptar los términos y condiciones
          </div>
        }

        <!-- Error message -->
        @if (errorMessage) {
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <mat-icon class="h-5 w-5 text-red-400">error</mat-icon>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Success message -->
        @if (successMessage) {
          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <mat-icon class="h-5 w-5 text-green-400">check_circle</mat-icon>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">{{ successMessage }}</p>
              </div>
            </div>
          </div>
        }

        <!-- Botón de registro -->
        <div>
          <button
            type="submit"
            [disabled]="signUpForm.invalid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            @if (isLoading) {
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <mat-icon class="animate-spin h-5 w-5 text-white">autorenew</mat-icon>
              </span>
            }
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </div>

        <!-- Link de login -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/sign-in" class="font-medium text-primary hover:text-primary-600 transition-colors duration-200">
              Inicia sesión aquí
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
export class SignUpComponent implements OnInit, OnDestroy {
  signUpForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
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
    this.signUpForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasena: ['', [Validators.required]],
      aceptarTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const passwordControl = control.get('contrasena');
    const confirmControl = control.get('confirmarContrasena');

    if (!passwordControl || !confirmControl) {
      return null;
    }

    const password = passwordControl.value;
    const confirm = confirmControl.value;

    // Merge with existing errors without mutating directly
    const currentErrors = { ...(confirmControl.errors || {}) } as { [key: string]: any };

    if (password !== confirm) {
      // Add/keep passwordMismatch without overriding other errors
      confirmControl.setErrors({ ...currentErrors, passwordMismatch: true });
      return null;
    }

    // Remove passwordMismatch while preserving other errors
    const { passwordMismatch, ...remaining } = currentErrors;
    const hasRemaining = Object.keys(remaining).length > 0;
    confirmControl.setErrors(hasRemaining ? remaining : null);
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { nombre, usuario, email, contrasena, confirmarContrasena } = this.signUpForm.value;

      this.authService.register({ username: usuario, email, password: contrasena, name: nombre, confirmPassword: confirmarContrasena, acceptTerms: true })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: AuthResult) => {
            this.isLoading = false;
            this.successMessage = 'Cuenta creada exitosamente. Redirigiendo...';
            
            // Redirigir después de un breve delay
            setTimeout(() => {
              this.router.navigate(['/auth/sign-in']);
            }, 2000);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.errorMessage = this.getErrorMessage(error);
          }
        });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.signUpForm.controls).forEach(key => {
        this.signUpForm.get(key)?.markAsTouched();
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

    return 'Error al crear la cuenta. Por favor, intenta nuevamente.';
  }
}
