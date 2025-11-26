import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface ConfigurationData {
  // Configuración Básica
  cNombreConfiguracion: string;
  cDescripcionConfiguracion: string;
  cTipoConfiguracion: string;
  bConfiguracionActiva: boolean;
  
  // Configuración de Seguridad
  nTiempoExpiracionToken: number;
  bRequiereAutenticacion: boolean;
  cNivelSeguridad: string;
  cIpsPermitidas: string[];
  bLogearAccesos: boolean;
  
  // Configuración de Empresas
  bPermitirMultiplesEmpresas: boolean;
  nMaximoEmpresas: number;
  bRequiereAprobacionEmpresa: boolean;
  cTipoAccesoEmpresa: string;
}

@Component({
  selector: 'app-configuration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="wizard-container">
      <div class="wizard-header">
        <h2 class="wizard-title">Configuración de Aplicación</h2>
        <p class="wizard-subtitle">Configure su aplicación en 3 sencillos pasos</p>
      </div>

      <mat-stepper [linear]="true" #stepper class="wizard-stepper">
        <!-- Paso 1: Configuración Básica -->
        <mat-step [stepControl]="basicConfigForm" label="Configuración Básica" state="basic">
          <ng-template matStepLabel>
            <div class="step-label">
              <mat-icon>settings</mat-icon>
              <span>Básica</span>
            </div>
          </ng-template>
          
          <div class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon">tune</mat-icon>
              <div>
                <h3>Configuración Básica</h3>
                <p>Defina los parámetros fundamentales de su aplicación</p>
              </div>
            </div>

            <form [formGroup]="basicConfigForm" class="config-form">
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nombre de Configuración</mat-label>
                  <input matInput formControlName="cNombreConfiguracion" placeholder="Ej: Configuración Producción">
                  <mat-icon matSuffix>label</mat-icon>
                  <mat-error *ngIf="basicConfigForm.get('cNombreConfiguracion')?.hasError('required')">
                    El nombre es requerido
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="cDescripcionConfiguracion" 
                           placeholder="Describe el propósito de esta configuración" rows="3"></textarea>
                  <mat-icon matSuffix>description</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Configuración</mat-label>
                  <mat-select formControlName="cTipoConfiguracion">
                    <mat-option value="desarrollo">Desarrollo</mat-option>
                    <mat-option value="pruebas">Pruebas</mat-option>
                    <mat-option value="produccion">Producción</mat-option>
                    <mat-option value="staging">Staging</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>category</mat-icon>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="bConfiguracionActiva" color="primary">
                    <span class="toggle-label">Configuración Activa</span>
                  </mat-slide-toggle>
                  <mat-icon matTooltip="Indica si esta configuración está activa y puede ser utilizada">info</mat-icon>
                </div>
              </div>
            </form>

            <div class="step-actions">
              <button mat-raised-button color="primary" (click)="nextStep()" 
                      [disabled]="!basicConfigForm.valid">
                Siguiente
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Paso 2: Configuración de Seguridad -->
        <mat-step [stepControl]="securityConfigForm" label="Seguridad" state="security">
          <ng-template matStepLabel>
            <div class="step-label">
              <mat-icon>security</mat-icon>
              <span>Seguridad</span>
            </div>
          </ng-template>

          <div class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon security-icon">shield</mat-icon>
              <div>
                <h3>Configuración de Seguridad</h3>
                <p>Establezca los parámetros de seguridad y acceso</p>
              </div>
            </div>

            <form [formGroup]="securityConfigForm" class="config-form">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Tiempo de Expiración (días)</mat-label>
                  <input matInput type="number" formControlName="nTiempoExpiracionToken" 
                         placeholder="365" min="1" max="3650">
                  <mat-icon matSuffix>schedule</mat-icon>
                  <mat-error *ngIf="securityConfigForm.get('nTiempoExpiracionToken')?.hasError('required')">
                    El tiempo de expiración es requerido
                  </mat-error>
                  <mat-error *ngIf="securityConfigForm.get('nTiempoExpiracionToken')?.hasError('min')">
                    Mínimo 1 día
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nivel de Seguridad</mat-label>
                  <mat-select formControlName="cNivelSeguridad">
                    <mat-option value="bajo">Bajo</mat-option>
                    <mat-option value="medio">Medio</mat-option>
                    <mat-option value="alto">Alto</mat-option>
                    <mat-option value="critico">Crítico</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>verified_user</mat-icon>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="bRequiereAutenticacion" color="primary">
                    <span class="toggle-label">Requiere Autenticación</span>
                  </mat-slide-toggle>
                  <mat-icon matTooltip="Indica si se requiere autenticación para acceder">info</mat-icon>
                </div>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="bLogearAccesos" color="primary">
                    <span class="toggle-label">Registrar Accesos</span>
                  </mat-slide-toggle>
                  <mat-icon matTooltip="Registra todos los accesos en logs de auditoría">info</mat-icon>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>IPs Permitidas (separadas por coma)</mat-label>
                  <input matInput formControlName="ipsPermitidas" 
                         placeholder="192.168.1.1, 10.0.0.1, 172.16.0.1">
                  <mat-icon matSuffix>computer</mat-icon>
                  <mat-hint>Deje vacío para permitir todas las IPs</mat-hint>
                </mat-form-field>
              </div>
            </form>

            <div class="step-actions">
              <button mat-button (click)="previousStep()">
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
              <button mat-raised-button color="primary" (click)="nextStep()" 
                      [disabled]="!securityConfigForm.valid">
                Siguiente
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        </mat-step>

        <!-- Paso 3: Configuración de Empresas -->
        <mat-step [stepControl]="companyConfigForm" label="Empresas" state="companies">
          <ng-template matStepLabel>
            <div class="step-label">
              <mat-icon>business</mat-icon>
              <span>Empresas</span>
            </div>
          </ng-template>

          <div class="step-content">
            <div class="step-header">
              <mat-icon class="step-icon company-icon">domain</mat-icon>
              <div>
                <h3>Configuración de Empresas</h3>
                <p>Configure el acceso y gestión de empresas</p>
              </div>
            </div>

            <form [formGroup]="companyConfigForm" class="config-form">
              <div class="form-grid">
                <div class="toggle-field">
                  <mat-slide-toggle formControlName="bPermitirMultiplesEmpresas" color="primary">
                    <span class="toggle-label">Permitir Múltiples Empresas</span>
                  </mat-slide-toggle>
                  <mat-icon matTooltip="Permite que un usuario gestione múltiples empresas">info</mat-icon>
                </div>

                <mat-form-field appearance="outline" 
                               [class.disabled]="!companyConfigForm.get('bPermitirMultiplesEmpresas')?.value">
                  <mat-label>Máximo de Empresas</mat-label>
                  <input matInput type="number" formControlName="nMaximoEmpresas" 
                         placeholder="10" min="1" max="100"
                         [disabled]="!companyConfigForm.get('bPermitirMultiplesEmpresas')?.value">
                  <mat-icon matSuffix>format_list_numbered</mat-icon>
                  <mat-error *ngIf="companyConfigForm.get('nMaximoEmpresas')?.hasError('min')">
                    Mínimo 1 empresa
                  </mat-error>
                </mat-form-field>

                <div class="toggle-field">
                  <mat-slide-toggle formControlName="bRequiereAprobacionEmpresa" color="primary">
                    <span class="toggle-label">Requiere Aprobación</span>
                  </mat-slide-toggle>
                  <mat-icon matTooltip="Las nuevas empresas requieren aprobación antes de ser activadas">info</mat-icon>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Acceso</mat-label>
                  <mat-select formControlName="cTipoAccesoEmpresa">
                    <mat-option value="publico">Público</mat-option>
                    <mat-option value="privado">Privado</mat-option>
                    <mat-option value="restringido">Restringido</mat-option>
                    <mat-option value="invitacion">Por Invitación</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>lock_open</mat-icon>
                </mat-form-field>
              </div>

              <!-- Resumen de Configuración -->
              <div class="config-summary">
                <h4>Resumen de Configuración</h4>
                <div class="summary-grid">
                  <div class="summary-item">
                    <mat-icon>settings</mat-icon>
                    <div>
                      <span class="summary-label">Configuración:</span>
                      <span class="summary-value">{{ basicConfigForm.get('cNombreConfiguracion')?.value || 'Sin nombre' }}</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <mat-icon>security</mat-icon>
                    <div>
                      <span class="summary-label">Seguridad:</span>
                      <span class="summary-value">{{ securityConfigForm.get('cNivelSeguridad')?.value || 'No definido' }}</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <mat-icon>business</mat-icon>
                    <div>
                      <span class="summary-label">Empresas:</span>
                      <span class="summary-value">
                        {{ companyConfigForm.get('bPermitirMultiplesEmpresas')?.value ? 'Múltiples' : 'Una sola' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div class="step-actions">
              <button mat-button (click)="previousStep()">
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
              <button mat-raised-button color="primary" (click)="completeConfiguration()" 
                      [disabled]="!companyConfigForm.valid" class="complete-button">
                <mat-icon>check_circle</mat-icon>
                Completar Configuración
              </button>
            </div>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [`
    .wizard-container {
      @apply max-w-4xl mx-auto p-6;
    }

    .wizard-header {
      @apply text-center mb-8;
    }

    .wizard-title {
      @apply text-3xl font-bold text-gray-900 mb-2;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .wizard-subtitle {
      @apply text-lg text-gray-600;
    }

    .wizard-stepper {
      @apply bg-white rounded-xl shadow-lg;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    }

    .step-label {
      @apply flex items-center space-x-2;
    }

    .step-content {
      @apply p-6 space-y-6;
    }

    .step-header {
      @apply flex items-center space-x-4 pb-4 border-b border-gray-200;
    }

    .step-icon {
      @apply w-12 h-12 p-2 rounded-full bg-blue-100 text-blue-600;
    }

    .step-icon.security-icon {
      @apply bg-green-100 text-green-600;
    }

    .step-icon.company-icon {
      @apply bg-purple-100 text-purple-600;
    }

    .step-header h3 {
      @apply text-xl font-semibold text-gray-900;
    }

    .step-header p {
      @apply text-gray-600;
    }

    .config-form {
      @apply space-y-4;
    }

    .form-grid {
      @apply grid grid-cols-1 md:grid-cols-2 gap-4;
    }

    .full-width {
      @apply md:col-span-2;
    }

    .toggle-field {
      @apply flex items-center justify-between p-4 bg-gray-50 rounded-lg border;
    }

    .toggle-label {
      @apply font-medium text-gray-700;
    }

    .disabled {
      @apply opacity-50;
    }

    .config-summary {
      @apply mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border;
    }

    .config-summary h4 {
      @apply text-lg font-semibold text-gray-900 mb-4;
    }

    .summary-grid {
      @apply grid grid-cols-1 md:grid-cols-3 gap-4;
    }

    .summary-item {
      @apply flex items-center space-x-3;
    }

    .summary-label {
      @apply block text-sm font-medium text-gray-600;
    }

    .summary-value {
      @apply block text-sm text-gray-900 capitalize;
    }

    .step-actions {
      @apply flex justify-between items-center pt-4 border-t border-gray-200;
    }

    .complete-button {
      @apply bg-gradient-to-r from-green-500 to-green-600 text-white;
    }

    .complete-button:hover {
      @apply from-green-600 to-green-700;
    }

    /* Animations */
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .step-content {
      animation: slideIn 0.5s ease-out;
    }

    /* Material Stepper Customization */
    ::ng-deep .mat-stepper-horizontal {
      @apply bg-transparent;
    }

    ::ng-deep .mat-step-header {
      @apply p-4;
    }

    ::ng-deep .mat-step-header.cdk-keyboard-focused,
    ::ng-deep .mat-step-header.cdk-program-focused,
    ::ng-deep .mat-step-header:hover {
      @apply bg-blue-50;
    }

    ::ng-deep .mat-step-icon-selected {
      @apply bg-blue-600;
    }

    ::ng-deep .mat-step-icon-state-done {
      @apply bg-green-600;
    }
  `]
})
export class ConfigurationWizardComponent implements OnInit {
  @Input() initialData?: Partial<ConfigurationData>;
  @Output() configurationComplete = new EventEmitter<ConfigurationData>();
  @Output() configurationCancel = new EventEmitter<void>();

  basicConfigForm!: FormGroup;
  securityConfigForm!: FormGroup;
  companyConfigForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    if (this.initialData) {
      this.populateFormsWithInitialData();
    }
  }

  private initializeForms(): void {
    this.basicConfigForm = this.fb.group({
      cNombreConfiguracion: ['', [Validators.required, Validators.minLength(3)]],
      cDescripcionConfiguracion: [''],
      cTipoConfiguracion: ['desarrollo', Validators.required],
      bConfiguracionActiva: [true]
    });

    this.securityConfigForm = this.fb.group({
      nTiempoExpiracionToken: [365, [Validators.required, Validators.min(1), Validators.max(3650)]],
      bRequiereAutenticacion: [true],
      cNivelSeguridad: ['medio', Validators.required],
      ipsPermitidas: [''],
      bLogearAccesos: [true]
    });

    this.companyConfigForm = this.fb.group({
      bPermitirMultiplesEmpresas: [false],
      nMaximoEmpresas: [1, [Validators.min(1), Validators.max(100)]],
      bRequiereAprobacionEmpresa: [false],
      cTipoAccesoEmpresa: ['publico', Validators.required]
    });

    // Watch for changes in multiple companies toggle
    this.companyConfigForm.get('bPermitirMultiplesEmpresas')?.valueChanges.subscribe(value => {
      const maxEmpresasControl = this.companyConfigForm.get('nMaximoEmpresas');
      if (value) {
        maxEmpresasControl?.setValue(10);
        maxEmpresasControl?.enable();
      } else {
        maxEmpresasControl?.setValue(1);
        maxEmpresasControl?.disable();
      }
    });
  }

  private populateFormsWithInitialData(): void {
    if (this.initialData) {
      this.basicConfigForm.patchValue(this.initialData);
      this.securityConfigForm.patchValue(this.initialData);
      this.companyConfigForm.patchValue(this.initialData);
      
      // Handle IPs array
      if (this.initialData.cIpsPermitidas) {
        this.securityConfigForm.patchValue({
          ipsPermitidas: this.initialData.cIpsPermitidas.join(', ')
        });
      }
    }
  }

  nextStep(): void {
    // The stepper will handle the navigation automatically
  }

  previousStep(): void {
    // The stepper will handle the navigation automatically
  }

  completeConfiguration(): void {
    if (this.basicConfigForm.valid && this.securityConfigForm.valid && this.companyConfigForm.valid) {
      const configurationData: ConfigurationData = {
        ...this.basicConfigForm.value,
        ...this.securityConfigForm.value,
        ...this.companyConfigForm.value,
        cIpsPermitidas: this.parseIpsPermitidas(this.securityConfigForm.get('ipsPermitidas')?.value || '')
      };

      this.configurationComplete.emit(configurationData);
    }
  }

  private parseIpsPermitidas(ipsString: string): string[] {
    if (!ipsString.trim()) return [];
    return ipsString.split(',').map(ip => ip.trim()).filter(ip => ip.length > 0);
  }

  cancelConfiguration(): void {
    this.configurationCancel.emit();
  }
}