import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../infrastructure/services/auth.service';
import { AuthResult } from '../../domain/models/application.model';

@Component({
  selector: 'app-sign-up',
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
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
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
          <div *ngIf="signUpForm.get('nombre')?.invalid && signUpForm.get('nombre')?.touched" class="mt-1 text-sm text-red-600">
            <span *ngIf="signUpForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
            <span *ngIf="signUpForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 2 caracteres</span>
          </div>
        </div>
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
              [class.border-red-500]="signUpForm.get('usuario')?.invalid && signUpForm.get('usuario')?.touched"
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div *ngIf="signUpForm.get('usuario')?.invalid && signUpForm.get('usuario')?.touched" class="mt-1 text-sm text-red-600">
            <span *ngIf="signUpForm.get('usuario')?.errors?.['required']">El usuario es requerido</span>
            <span *ngIf="signUpForm.get('usuario')?.errors?.['minlength']">El usuario debe tener al menos 3 caracteres</span>
          </div>
        </div>

        <!-- Correo Electrónico -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
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
          <div *ngIf="signUpForm.get('email')?.invalid && signUpForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
            <span *ngIf="signUpForm.get('email')?.errors?.['required']">El correo electrónico es requerido</span>
            <span *ngIf="signUpForm.get('email')?.errors?.['email']">Ingresa un correo electrónico válido</span>
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
              [class.border-red-500]="signUpForm.get('contrasena')?.invalid && signUpForm.get('contrasena')?.touched"
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
          <div *ngIf="signUpForm.get('contrasena')?.invalid && signUpForm.get('contrasena')?.touched" class="mt-1 text-sm text-red-600">
            <span *ngIf="signUpForm.get('contrasena')?.errors?.['required']">La contraseña es requerida</span>
            <span *ngIf="signUpForm.get('contrasena')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
          </div>
        </div>

        <!-- Confirmar Contraseña -->
        <div>
          <label for="confirmarContrasena" class="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
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
                <svg *ngIf="!showConfirmPassword" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                </svg>
                <svg *ngIf="showConfirmPassword" class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/>
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                </svg>
              </button>
            </div>
          </div>
          <div *ngIf="signUpForm.get('confirmarContrasena')?.invalid && signUpForm.get('confirmarContrasena')?.touched" class="mt-1 text-sm text-red-600">
            <span *ngIf="signUpForm.get('confirmarContrasena')?.errors?.['required']">Confirma tu contraseña</span>
            <span *ngIf="signUpForm.get('confirmarContrasena')?.errors?.['passwordMismatch']">Las contraseñas no coinciden</span>
          </div>
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
        <div *ngIf="signUpForm.get('aceptarTerminos')?.invalid && signUpForm.get('aceptarTerminos')?.touched" class="mt-1 text-sm text-red-600">
          Debes aceptar los términos y condiciones
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

        <!-- Success message -->
        <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Botón de registro -->
        <div>
          <button
            type="submit"
            [disabled]="signUpForm.invalid || isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
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

      this.authService.register({ email, password: contrasena, name: nombre, confirmPassword: confirmarContrasena, acceptTerms: true })
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