import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  DEFAULT_CONFIGURACION_APLICACION_ENTITY,
  IConfiguracionAplicacionEntity,
  ICreateConfiguracionAplicacionEntityDto,
  IUpdateConfiguracionAplicacionEntityDto
} from '../../domain/entities/configuracion-aplicacion.entity';
import { ApplicationService } from '../../infrastructure/services/application.service';
import { ConfigurationEntityService } from '../../infrastructure/services/configuration-entity.service';
import { IAplicacion } from '../../shared/interfaces';
import { ModalContainerComponent } from '../components/modal-container/modal-container.component';

@Component({
  selector: 'app-configuraciones-entity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonModule,
    ModalContainerComponent
  ],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Configuraciones de Aplicación</h1>
          <p class="text-gray-600 mt-1">Gestiona la configuración de las aplicaciones del sistema</p>
        </div>
      </div>

      <!-- Selector de Aplicación -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-2">Aplicación</label>
            <mat-form-field appearance="outline" class="w-full">
              <mat-select [(value)]="selectedAplicacionId" (selectionChange)="onAplicacionChange()">
                <mat-option [value]="null">Seleccionar aplicación</mat-option>
                @for (app of aplicaciones; track app.nAplicacionesId) {
                  <mat-option [value]="app.nAplicacionesId">
                    {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
          <div class="flex items-center justify-center self-center">
            @if (!hasConfiguration && selectedAplicacionId) {
              <button
                (click)="openCreateModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Crear Configuración
              </button>
            }
            @if (hasConfiguration && selectedAplicacionId) {
              <button
                (click)="openEditModal()"
                class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Editar Configuración
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Vista de Configuración -->
      @if (selectedAplicacionId && hasConfiguration && configuracion) {
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Configuración Actual</h2>
          <p class="text-sm text-gray-600">Vista de solo lectura de la configuración de la aplicación</p>
        </div>
        
        <div class="p-6">
          <!-- Configuraciones de Adjuntos -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-gray-800 mb-4">Configuración de Adjuntos</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tamaño máximo de archivo</label>
                <p class="text-sm text-gray-900">{{ formatFileSize(configuracion.nAdjuntosMaxTamanoArchivo) }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipos de archivos permitidos</label>
                <ul class="text-sm text-gray-900 grid grid-cols-2 gap-y-1">
                  @for (t of getTiposArchivos(configuracion.cAdjuntosTiposArchivosPermitidos); track t) {
                    <li class="uppercase">{{ t }}</li>
                  }
                </ul>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Máximo de archivos simultáneos</label>
                <p class="text-sm text-gray-900">{{ configuracion.nAdjuntosMaxArchivosSimultaneos }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir adjuntos</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bAdjuntosPermitirAdjuntos ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bAdjuntosPermitirAdjuntos ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir imágenes</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bAdjuntosPermitirImagenes ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bAdjuntosPermitirImagenes ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir documentos</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bAdjuntosPermitirDocumentos ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bAdjuntosPermitirDocumentos ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Configuraciones de Chat -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-gray-800 mb-4">Configuración de Chat</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Longitud máxima de mensaje</label>
                <p class="text-sm text-gray-900">{{ configuracion.nChatMaxLongitudMensaje }} caracteres</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir emojis</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bChatPermitirEmojis ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bChatPermitirEmojis ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir menciones</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bChatPermitirMenciones ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bChatPermitirMenciones ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir reacciones</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bChatPermitirReacciones ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bChatPermitirReacciones ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir edición de mensajes</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bChatPermitirEdicionMensajes ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bChatPermitirEdicionMensajes ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Permitir mensajes privados</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bChatPermitirMensajesPrivados ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bChatPermitirMensajesPrivados ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Configuraciones de Seguridad -->
          <div class="mb-8">
            <h3 class="text-md font-semibold text-gray-800 mb-4">Configuración de Seguridad</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Requiere autenticación</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bSeguridadRequiereAutenticacion ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bSeguridadRequiereAutenticacion ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Encriptar mensajes</label>
                <p class="text-sm text-gray-900">
                  <span [class]="configuracion.bSeguridadEncriptarMensajes ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bSeguridadEncriptarMensajes ? 'Sí' : 'No' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo de sesión</label>
                <p class="text-sm text-gray-900">{{ formatDuration(configuracion.nSeguridadTiempoSesionMinutos) }}</p>
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="border-t pt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <p class="text-sm">
                  <span [class]="configuracion.bConfiguracionEstaActiva ? 'text-green-600' : 'text-red-600'">
                    {{ configuracion.bConfiguracionEstaActiva ? 'Activa' : 'Inactiva' }}
                  </span>
                </p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-medium text-gray-700 mb-1">Última modificación</label>
                <p class="text-sm text-gray-900">{{ formatDate(configuracion.dConfiguracionFechaModificacion) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Mensaje cuando no hay configuración -->
      @if (selectedAplicacionId && !hasConfiguration && !loading) {
      <div class="bg-white rounded-lg shadow-sm p-6 text-center">
        <div class="text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay configuración</h3>
          <p class="mt-1 text-sm text-gray-500">Esta aplicación aún no tiene una configuración asignada.</p>
          <div class="mt-6">
            <button
              (click)="openCreateModal()"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Crear Configuración
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Loading -->
      @if (loading) {
        <div class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>

    <!-- Modal para Crear/Editar Configuración -->
    <app-modal-container
      [show]="showModal"
      [title]="isEditing ? 'Editar Configuración de Aplicación' : 'Crear Configuración de Aplicación'"
      [submitLabel]="submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')"
      [submitting]="submitting"
      [disableSubmit]="configForm.invalid"
      (cancel)="closeModal()"
      (submit)="onSubmit()"
    >
      <form [formGroup]="configForm">
        <div class="space-y-8">
            <!-- Configuraciones de Adjuntos -->
            <mat-card class="mb-6 shadow-sm">
              <mat-card-header>
              <mat-card-title class="pb-2">Configuración de Adjuntos</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Tamaño máximo de archivo (MB)</mat-label>
                    <input matInput type="number" min="1" step="1" formControlName="nAdjuntosMaxTamanoArchivoMB">
                    <mat-hint align="start">1 MB = 1024 KB</mat-hint>
                    <mat-hint align="end">Se convertirá a bytes al guardar</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Máximo de archivos simultáneos</mat-label>
                    <input matInput type="number" min="1" step="1" formControlName="nAdjuntosMaxArchivosSimultaneos">
                  </mat-form-field>
                </div>

                <div class="grid grid-cols-1 gap-4 mt-4">
                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Agregar tipo de archivo</label>
                    <div class="flex gap-3">
                      <mat-form-field appearance="outline" class="flex-1">
                        <mat-label>Ej: pdf</mat-label>
                        <input matInput type="text" [(ngModel)]="nuevoTipoArchivo" [ngModelOptions]="{standalone: true}" name="nuevoTipoArchivo" (keyup.enter)="addTipoArchivo()">
                        <mat-hint align="start">Usa abreviaturas cortas: pdf, jpg, png, docx</mat-hint>
                      </mat-form-field>
                      <button mat-stroked-button color="primary" type="button" (click)="addTipoArchivo()">Agregar</button>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                      <button type="button" mat-stroked-button (click)="addSuggestion('pdf')">pdf</button>
                      <button type="button" mat-stroked-button (click)="addSuggestion('jpg')">jpg</button>
                      <button type="button" mat-stroked-button (click)="addSuggestion('png')">png</button>
                      <button type="button" mat-stroked-button (click)="addSuggestion('docx')">docx</button>
                    </div>
                  </div>
                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipos de archivos permitidos</label>
                      <div class="w-full rounded-lg p-1">
                        @if ((tiposArchivos?.length || 0) === 0) {
                          <div class="text-sm text-gray-500">No hay tipos agregados</div>
                        }
                        @for (t of tiposArchivos; track t) {
                          <div class="flex items-center justify-between py-2 px-2 rounded">
                            <span class="text-sm font-medium text-gray-800 uppercase tracking-wide">{{ t }}</span>
                            <button type="button" class="text-gray-500 hover:text-red-600" (click)="removeTipoArchivo(t)" aria-label="Quitar">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        }
                      </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosPermitirAdjuntos">Permitir adjuntos</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosPermitirImagenes">Permitir imágenes</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosPermitirDocumentos">Permitir documentos</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosPermitirVideos">Permitir videos</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosPermitirAudio">Permitir audio</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bAdjuntosRequiereAprobacion">Requiere aprobación</mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-divider class="my-2"></mat-divider>

            <!-- Configuraciones de Chat -->
            <mat-card class="mb-6 shadow-sm">
              <mat-card-header>
              <mat-card-title class="pb-2">Configuración de Chat</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Longitud máxima de mensaje</mat-label>
                    <input matInput type="number" min="1" step="1" formControlName="nChatMaxLongitudMensaje">
                  </mat-form-field>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirEmojis">Permitir emojis</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirMenciones">Permitir menciones</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirReacciones">Permitir reacciones</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirEdicionMensajes">Permitir edición</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirEliminacionMensajes">Permitir eliminación</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bChatPermitirMensajesPrivados">Permitir mensajes privados</mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-divider class="my-2"></mat-divider>

            <!-- Configuraciones de Seguridad -->
            <mat-card class="mb-6 shadow-sm">
              <mat-card-header>
              <mat-card-title class="pb-2">Configuración de Seguridad</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Tiempo de sesión (minutos)</mat-label>
                    <input matInput type="number" min="1" step="1" formControlName="nSeguridadTiempoSesionMinutos">
                  </mat-form-field>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <mat-slide-toggle color="primary" formControlName="bSeguridadRequiereAutenticacion">Requiere autenticación</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bSeguridadEncriptarMensajes">Encriptar mensajes</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bSeguridadRequiere2FA">Requiere 2FA</mat-slide-toggle>
                  <mat-slide-toggle color="primary" formControlName="bSeguridadPermitirSesionesMultiples">Permitir sesiones múltiples</mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
            <mat-divider class="my-2"></mat-divider>

            <!-- Configuración General -->
            <mat-card class="mb-2 shadow-sm">
              <mat-card-header>
              <mat-card-title class="pb-2">Configuración General</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="flex flex-wrap gap-6">
                  <mat-slide-toggle color="primary" formControlName="bConfiguracionEstaActiva">Configuración activa</mat-slide-toggle>
                </div>
              </mat-card-content>
            </mat-card>
        </div>
      </form>
    </app-modal-container>
  `,
  styles: [`
    .container {
      max-width: 1400px;
    }
  `]
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  aplicaciones: IAplicacion[] = [];
  configuracion: IConfiguracionAplicacionEntity | null = null;
  hasConfiguration = false;

  // Filters
  selectedAplicacionId: number | null = null;

  // Loading states
  loading = false;
  submitting = false;

  // Modals
  showModal = false;
  isEditing = false;

  // Forms
  configForm: FormGroup;
  tiposArchivos: string[] = [];
  nuevoTipoArchivo = '';

  constructor(
    private configurationService: ConfigurationEntityService,
    private applicationService: ApplicationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.configForm = this.createConfigForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.route.queryParamMap.subscribe(params => {
      const appId = params.get('appId');
      if (appId) {
        this.selectedAplicacionId = +appId;
        this.loadConfiguration();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      // Configuraciones de adjuntos
      nAdjuntosMaxTamanoArchivo: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.nAdjuntosMaxTamanoArchivo, [Validators.required, Validators.min(1)]],
      nAdjuntosMaxTamanoArchivoMB: [Math.round(DEFAULT_CONFIGURACION_APLICACION_ENTITY.nAdjuntosMaxTamanoArchivo / (1024 * 1024)) , [Validators.required, Validators.min(1)]],
      cAdjuntosTiposArchivosPermitidos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.cAdjuntosTiposArchivosPermitidos, [Validators.required]],
      bAdjuntosPermitirAdjuntos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosPermitirAdjuntos],
      nAdjuntosMaxArchivosSimultaneos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.nAdjuntosMaxArchivosSimultaneos, [Validators.required, Validators.min(1)]],
      bAdjuntosPermitirImagenes: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosPermitirImagenes],
      bAdjuntosPermitirDocumentos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosPermitirDocumentos],
      bAdjuntosPermitirVideos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosPermitirVideos],
      bAdjuntosPermitirAudio: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosPermitirAudio],
      bAdjuntosRequiereAprobacion: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bAdjuntosRequiereAprobacion],
      
      // Configuraciones de chat
      nChatMaxLongitudMensaje: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.nChatMaxLongitudMensaje, [Validators.required, Validators.min(1)]],
      bChatPermitirEmojis: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirEmojis],
      bChatPermitirMenciones: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirMenciones],
      bChatPermitirReacciones: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirReacciones],
      bChatPermitirEdicionMensajes: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirEdicionMensajes],
      bChatPermitirEliminacionMensajes: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirEliminacionMensajes],
      bChatPermitirMensajesPrivados: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bChatPermitirMensajesPrivados],
      
      // Configuraciones de seguridad
      bSeguridadRequiereAutenticacion: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bSeguridadRequiereAutenticacion],
      bSeguridadEncriptarMensajes: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bSeguridadEncriptarMensajes],
      nSeguridadTiempoSesionMinutos: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.nSeguridadTiempoSesionMinutos, [Validators.required, Validators.min(1)]],
      bSeguridadRequiere2FA: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bSeguridadRequiere2FA],
      bSeguridadPermitirSesionesMultiples: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bSeguridadPermitirSesionesMultiples],
      
      // Estado
      bConfiguracionEstaActiva: [DEFAULT_CONFIGURACION_APLICACION_ENTITY.bConfiguracionEstaActiva]
    });
  }

  private loadInitialData(): void {
    this.loading = true;
    
    this.applicationService.getAplicacionesActivas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const appsAny: any = response;
          this.aplicaciones = Array.isArray(appsAny) ? appsAny : (appsAny?.lstItem ?? appsAny?.LstItem ?? []);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading aplicaciones:', error);
          this.loading = false;
        }
      });
  }

  loadConfiguration(): void {
    if (!this.selectedAplicacionId) {
      this.configuracion = null;
      this.hasConfiguration = false;
      return;
    }
    
    this.loading = true;
    
    this.configurationService.getConfiguracionByAplicacion(this.selectedAplicacionId!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.item ?? null;
          const hasData = !!data && Object.keys(data).length > 0;
          this.hasConfiguration = hasData;
          this.configuracion = hasData ? data : null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading configuration:', error);
          this.hasConfiguration = false;
          this.configuracion = null;
          this.loading = false;
        }
      });
  }

  onAplicacionChange(): void {
    if (this.selectedAplicacionId) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { appId: this.selectedAplicacionId },
        queryParamsHandling: 'merge'
      });
      this.loadConfiguration();
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.configForm.reset(DEFAULT_CONFIGURACION_APLICACION_ENTITY);
    this.configForm.patchValue({
      nAdjuntosMaxTamanoArchivoMB: Math.round(DEFAULT_CONFIGURACION_APLICACION_ENTITY.nAdjuntosMaxTamanoArchivo / (1024 * 1024))
    });
    this.tiposArchivos = (DEFAULT_CONFIGURACION_APLICACION_ENTITY.cAdjuntosTiposArchivosPermitidos || '').split(',').filter(x => !!x);
    this.showModal = true;
  }

  openEditModal(): void {
    if (!this.configuracion) return;
    
    this.isEditing = true;
    this.configForm.patchValue({
      nAdjuntosMaxTamanoArchivo: this.configuracion.nAdjuntosMaxTamanoArchivo,
      nAdjuntosMaxTamanoArchivoMB: Math.round(this.configuracion.nAdjuntosMaxTamanoArchivo / (1024 * 1024)),
      cAdjuntosTiposArchivosPermitidos: this.configuracion.cAdjuntosTiposArchivosPermitidos,
      bAdjuntosPermitirAdjuntos: this.configuracion.bAdjuntosPermitirAdjuntos,
      nAdjuntosMaxArchivosSimultaneos: this.configuracion.nAdjuntosMaxArchivosSimultaneos,
      bAdjuntosPermitirImagenes: this.configuracion.bAdjuntosPermitirImagenes,
      bAdjuntosPermitirDocumentos: this.configuracion.bAdjuntosPermitirDocumentos,
      bAdjuntosPermitirVideos: this.configuracion.bAdjuntosPermitirVideos,
      bAdjuntosPermitirAudio: this.configuracion.bAdjuntosPermitirAudio,
      bAdjuntosRequiereAprobacion: this.configuracion.bAdjuntosRequiereAprobacion,
      
      nChatMaxLongitudMensaje: this.configuracion.nChatMaxLongitudMensaje,
      bChatPermitirEmojis: this.configuracion.bChatPermitirEmojis,
      bChatPermitirMenciones: this.configuracion.bChatPermitirMenciones,
      bChatPermitirReacciones: this.configuracion.bChatPermitirReacciones,
      bChatPermitirEdicionMensajes: this.configuracion.bChatPermitirEdicionMensajes,
      bChatPermitirEliminacionMensajes: this.configuracion.bChatPermitirEliminacionMensajes,
      bChatPermitirMensajesPrivados: this.configuracion.bChatPermitirMensajesPrivados,
      
      bSeguridadRequiereAutenticacion: this.configuracion.bSeguridadRequiereAutenticacion,
      bSeguridadEncriptarMensajes: this.configuracion.bSeguridadEncriptarMensajes,
      nSeguridadTiempoSesionMinutos: this.configuracion.nSeguridadTiempoSesionMinutos,
      bSeguridadRequiere2FA: this.configuracion.bSeguridadRequiere2FA,
      bSeguridadPermitirSesionesMultiples: this.configuracion.bSeguridadPermitirSesionesMultiples,
      
      bConfiguracionEstaActiva: this.configuracion.bConfiguracionEstaActiva
    });
    this.tiposArchivos = (this.configuracion.cAdjuntosTiposArchivosPermitidos || '').split(',').filter(x => !!x);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.configForm.reset();
  }

  onSubmit(): void {
    if (this.configForm.valid && this.selectedAplicacionId) {
      this.submitting = true;

      if (this.isEditing && this.configuracion) {
        // Actualizar configuración existente
        const updateDto: IUpdateConfiguracionAplicacionEntityDto = {
          ...this.configForm.value,
          nAdjuntosMaxTamanoArchivo: (this.configForm.value.nAdjuntosMaxTamanoArchivoMB ?? 1) * 1024 * 1024,
          cAdjuntosTiposArchivosPermitidos: this.tiposArchivos.join(',')
        };
        
        this.configurationService.updateConfiguracion(this.selectedAplicacionId!, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModal();
              this.loadConfiguration();
            },
            error: (error) => {
              console.error('Error updating configuration:', error);
              this.submitting = false;
            }
          });
      } else {
        // Crear nueva configuración
        const createDto: ICreateConfiguracionAplicacionEntityDto = {
          nAplicacionesId: this.selectedAplicacionId,
          ...this.configForm.value,
          nAdjuntosMaxTamanoArchivo: (this.configForm.value.nAdjuntosMaxTamanoArchivoMB ?? 1) * 1024 * 1024,
          cAdjuntosTiposArchivosPermitidos: this.tiposArchivos.join(',')
        };
        
        this.configurationService.createConfiguracion(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModal();
              this.loadConfiguration();
            },
            error: (error) => {
              console.error('Error creating configuration:', error);
              this.submitting = false;
            }
          });
      }
    }
  }

  // Helper methods
  addTipoArchivo(): void {
    const valRaw = (this.nuevoTipoArchivo || '').trim().toLowerCase();
    if (!/^[a-z0-9]{2,5}$/.test(valRaw)) return;
    if (!this.tiposArchivos.includes(valRaw)) {
      this.tiposArchivos = [...this.tiposArchivos, valRaw];
    }
    this.nuevoTipoArchivo = '';
  }

  removeTipoArchivo(tipo: string): void {
    this.tiposArchivos = this.tiposArchivos.filter(t => t !== tipo);
  }
  addSuggestion(tipo: string): void {
    this.nuevoTipoArchivo = tipo;
    this.addTipoArchivo();
  }
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  }

  formatDate(dateString: string): string {
    if (!dateString || dateString === '0001-01-01T00:00:00') {
      return 'Nunca';
    }
    return new Date(dateString).toLocaleString('es-ES');
  }

  getTiposArchivos(valor: string): string[] {
    return (valor || '').split(',').map(s => s.trim()).filter(x => !!x);
  }
}
