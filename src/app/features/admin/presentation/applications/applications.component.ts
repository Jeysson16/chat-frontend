import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { TokenDisplayComponent } from '../../../../shared/components/molecules/token-display/token-display.component';
import { AuthTokensService, TokenData, TokensAplicacionResponse, ValidacionTokenResponse } from '../../../auth/infrastructure/services/auth-tokens.service';
import { Application } from '../../domain/entities/application.entity';
import { ApplicationService } from '../../infrastructure/services/application.service';

@Component({
  selector: 'app-aplicaciones',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    TokenDisplayComponent
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div class="container mx-auto p-6">
        <!-- Header compacto -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-semibold text-gray-900">Gestión de Aplicaciones</h1>
              <p class="text-sm text-gray-500">Administra aplicaciones registradas</p>
            </div>
            <button
              (click)="openCreateModal()"
              class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            >
              <mat-icon>add</mat-icon>
              Nueva
            </button>
          </div>
        </div>

        <!-- Filtros y búsqueda con diseño moderno -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Aplicaciones</label>
              <div class="relative">
                <input
                  type="text"
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event); onSearch()"
                  placeholder="Buscar por nombre o código..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                <mat-icon class="absolute left-3 top-3.5 text-gray-400">search</mat-icon>
              </div>
            </div>
            <div class="flex items-end">
              <button
                (click)="loadApplications()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <mat-icon>refresh</mat-icon>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- Listado responsive -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto hidden md:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aplicación
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Código
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let application of applications()" class="hover:bg-gray-50 transition-all duration-200">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ application.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <mat-icon class="text-white" style="font-size: 20px; width: 20px; height: 20px;">description</mat-icon>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ application.name }}
                        </div>
                        <div class="text-sm text-gray-500 max-w-xs truncate">
                          {{ application.description || 'Sin descripción' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                      {{ application.code }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="application.isActive ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    >
                      <mat-icon [class]="application.isActive ? 'text-green-500' : 'text-red-500'" style="font-size: 12px; width: 12px; height: 12px;" class="mr-1">
                        {{ application.isActive ? 'radio_button_checked' : 'radio_button_unchecked' }}
                      </mat-icon>
                      {{ application.isActive ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ application.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <div class="hidden md:flex justify-end gap-2">
                        <button (click)="goTo('config', application)" class="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50" title="Configuraciones">
                          <mat-icon>tune</mat-icon>
                        </button>
                        <button (click)="goTo('users', application)" class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" title="Usuarios">
                          <mat-icon>group</mat-icon>
                        </button>
                        <button (click)="goTo('companies', application)" class="text-emerald-600 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-50" title="Empresas">
                          <mat-icon>business</mat-icon>
                        </button>
                        <button (click)="editApplication(application)" class="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50" title="Editar">
                          <mat-icon>edit</mat-icon>
                        </button>
                        <button (click)="toggleStatus(application)" [class]="application.isActive ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'" class="p-2 rounded-lg" [title]="application.isActive ? 'Desactivar' : 'Activar'">
                          <mat-icon *ngIf="application.isActive">toggle_off</mat-icon>
                          <mat-icon *ngIf="!application.isActive">toggle_on</mat-icon>
                        </button>
                        <button (click)="deleteApplication(application)" class="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50" title="Eliminar">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                      <div class="md:hidden flex justify-end">
                        <button [matMenuTriggerFor]="menuActions" class="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #menuActions="matMenu">
                          <button mat-menu-item (click)="goTo('config', application)"><mat-icon>tune</mat-icon><span>Configuraciones</span></button>
                          <button mat-menu-item (click)="goTo('users', application)"><mat-icon>group</mat-icon><span>Usuarios</span></button>
                          <button mat-menu-item (click)="goTo('companies', application)"><mat-icon>business</mat-icon><span>Empresas</span></button>
                          <button mat-menu-item (click)="editApplication(application)"><mat-icon>edit</mat-icon><span>Editar</span></button>
                          <button mat-menu-item (click)="toggleStatus(application)"><mat-icon>toggle_on</mat-icon><span>{{ application.isActive ? 'Desactivar' : 'Activar' }}</span></button>
                          <button mat-menu-item (click)="deleteApplication(application)"><mat-icon>delete</mat-icon><span>Eliminar</span></button>
                        </mat-menu>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación moderna -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                (click)="previousPage()"
                [disabled]="currentPage() === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                Anterior
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage() >= totalPages()"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Mostrando
                  <span class="font-medium">{{ (currentPage() - 1) * pageSize() + 1 }}</span>
                  a
                  <span class="font-medium">{{ Math.min(currentPage() * pageSize(), totalItems()) }}</span>
                  de
                  <span class="font-medium">{{ totalItems() }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    (click)="previousPage()"
                    [disabled]="currentPage() === 1"
                    class="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                  >
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {{ currentPage() }} de {{ totalPages() }}
                  </span>
                  <button
                    (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages()"
                    class="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
                  >
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </nav>
              </div>
            </div>
          </div>
          <!-- Lista móvil -->
          <div class="md:hidden divide-y divide-gray-200">
            <div *ngFor="let application of applications()" class="p-4 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <mat-icon class="text-white" style="font-size: 20px; width: 20px; height: 20px;">description</mat-icon>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900">{{ application.name }}</div>
                    <div class="text-xs text-gray-500">{{ application.code }}</div>
                  </div>
                </div>
                <button [matMenuTriggerFor]="menuActionsMobile" class="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menuActionsMobile="matMenu">
                  <button mat-menu-item (click)="goTo('config', application)"><mat-icon>tune</mat-icon><span>Configuraciones</span></button>
                  <button mat-menu-item (click)="goTo('users', application)"><mat-icon>group</mat-icon><span>Usuarios</span></button>
                  <button mat-menu-item (click)="goTo('companies', application)"><mat-icon>business</mat-icon><span>Empresas</span></button>
                  <button mat-menu-item (click)="editApplication(application)"><mat-icon>edit</mat-icon><span>Editar</span></button>
                  <button mat-menu-item (click)="toggleStatus(application)"><mat-icon>toggle_on</mat-icon><span>{{ application.isActive ? 'Desactivar' : 'Activar' }}</span></button>
                  <button mat-menu-item (click)="deleteApplication(application)"><mat-icon>delete</mat-icon><span>Eliminar</span></button>
                </mat-menu>
              </div>
              <div class="mt-2 flex items-center gap-3">
                <span [class]="application.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-0.5 rounded text-xs">{{ application.isActive ? 'Activa' : 'Inactiva' }}</span>
                <span class="text-xs text-gray-500">{{ application.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading con animación moderna -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
          <div class="relative">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
        </div>

        <div *ngIf="isLoading()" class="px-6 pb-6">
          <table class="min-w-full">
            <tbody>
              <tr *ngFor="let _ of skeletonRows" class="skeleton-row">
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
                <td class="skeleton-cell"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal para crear/editar aplicación con diseño moderno -->
        <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">
                  {{ editingApplication ? 'Editar Aplicación' : 'Nueva Aplicación' }}
                </h3>
                <button
                  (click)="closeModal()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    formControlName="name"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nombre de la aplicación"
                  >
                  <div *ngIf="applicationForm.get('name')?.invalid && applicationForm.get('name')?.touched" 
                       class="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">error</mat-icon>
                    El nombre es requerido
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                  <input
                    type="text"
                    formControlName="code"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Código único de la aplicación"
                  >
                  <div *ngIf="applicationForm.get('code')?.invalid && applicationForm.get('code')?.touched" 
                       class="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <mat-icon style="font-size: 16px; width: 16px; height: 16px;">error</mat-icon>
                    El código es requerido
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    formControlName="description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Descripción de la aplicación"
                  ></textarea>
                </div>

                <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    formControlName="isActive"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    id="active-checkbox"
                  >
                  <label for="active-checkbox" class="ml-3 text-sm font-medium text-gray-700">
                    Aplicación activa
                  </label>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="applicationForm.invalid || submitting"
                    class="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                  >
                    <mat-spinner *ngIf="submitting" diameter="16"></mat-spinner>
                    {{ submitting ? 'Guardando...' : (editingApplication ? 'Actualizar' : 'Crear') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Modal para mostrar tokens -->
        <div *ngIf="showTokenModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 scale-100">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">
                  Tokens de Aplicación
                </h3>
                <button
                  (click)="closeTokenModal()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <app-token-display 
                *ngIf="currentTokenData" 
                [tokenData]="currentTokenData">
              </app-token-display>
              
              <div *ngIf="!currentTokenData" class="text-center py-8">
                <mat-icon class="mx-auto h-12 w-12 text-gray-400" style="font-size: 48px; width: 48px; height: 48px;">vpn_key</mat-icon>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No hay tokens disponibles</h3>
                <p class="mt-1 text-sm text-gray-500">Esta aplicación no tiene tokens generados.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal para configuración -->
        <div *ngIf="showConfigModal" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">
                  Configurar Aplicación
                </h3>
                <button
                  (click)="closeConfigModal()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              
              <!-- Configuration wizard removed - functionality to be implemented -->
              <div class="p-6 text-center text-gray-600">
                <mat-icon class="text-4xl mb-4">construction</mat-icon>
                <p>Configuración de aplicación en desarrollo</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal para flujo guiado -->
        <div *ngIf="showGuidedFlow" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl transform transition-all duration-300 scale-100 max-h-[95vh] overflow-y-auto">
            <div class="p-6">
              <!-- Header with progress -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex-1">
                  <h3 class="text-2xl font-bold text-gray-900 mb-2">
                    Configuración de Aplicación
                  </h3>
                  <p class="text-gray-600" *ngIf="guidedFlowApplication">
                    {{ guidedFlowApplication.name }}
                  </p>
                </div>
                <button
                  (click)="closeGuidedFlow()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <!-- Progress indicator -->
              <div class="mb-8">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <!-- Step 1: Tokens -->
                    <div class="flex items-center">
                      <div [class]="guidedFlowStep >= 1 ? 'w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold' : 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold'">
                        1
                      </div>
                      <span [class]="guidedFlowStep >= 1 ? 'ml-2 text-sm font-medium text-blue-600' : 'ml-2 text-sm font-medium text-gray-500'">
                        Tokens
                      </span>
                    </div>
                    
                    <!-- Connector -->
                    <div [class]="guidedFlowStep >= 2 ? 'w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded' : 'w-16 h-1 bg-gray-300 rounded'"></div>
                    
                    <!-- Step 2: Configuration -->
                    <div class="flex items-center">
                      <div [class]="guidedFlowStep >= 2 ? 'w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold' : 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold'">
                        2
                      </div>
                      <span [class]="guidedFlowStep >= 2 ? 'ml-2 text-sm font-medium text-blue-600' : 'ml-2 text-sm font-medium text-gray-500'">
                        Configuración
                      </span>
                    </div>
                    
                    <!-- Connector -->
                    <div [class]="guidedFlowStep >= 3 ? 'w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded' : 'w-16 h-1 bg-gray-300 rounded'"></div>
                    
                    <!-- Step 3: Companies -->
                    <div class="flex items-center">
                      <div [class]="guidedFlowStep >= 3 ? 'w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold' : 'w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold'">
                        3
                      </div>
                      <span [class]="guidedFlowStep >= 3 ? 'ml-2 text-sm font-medium text-blue-600' : 'ml-2 text-sm font-medium text-gray-500'">
                        Empresas
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step content -->
              <div class="min-h-[400px]">
                <!-- Step 1: Tokens -->
                <div *ngIf="guidedFlowStep === 1" class="space-y-6">
                  <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <mat-icon class="text-white" style="font-size: 32px; width: 32px; height: 32px;">vpn_key</mat-icon>
                    </div>
                    <h4 class="text-xl font-semibold text-gray-900 mb-2">¡Aplicación creada exitosamente!</h4>
                    <p class="text-gray-600">Se han generado automáticamente los tokens de acceso para tu aplicación.</p>
                  </div>
                  
                  <app-token-display 
                    *ngIf="currentTokenData" 
                    [tokenData]="currentTokenData">
                  </app-token-display>
                </div>

                <!-- Step 2: Configuration -->
                <div *ngIf="guidedFlowStep === 2" class="space-y-6">
                  <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <mat-icon class="text-white" style="font-size: 32px; width: 32px; height: 32px;">settings</mat-icon>
                    </div>
                    <h4 class="text-xl font-semibold text-gray-900 mb-2">Configurar Aplicación</h4>
                    <p class="text-gray-600">Personaliza la configuración de tu aplicación según tus necesidades.</p>
                  </div>
                  
                  <!-- Configuration wizard removed - functionality to be implemented -->
                  <div class="p-6 text-center text-gray-600">
                    <mat-icon class="text-4xl mb-4">construction</mat-icon>
                    <p>Configuración de aplicación en desarrollo</p>
                  </div>
                </div>

                <!-- Step 3: Companies -->
                <div *ngIf="guidedFlowStep === 3" class="space-y-6">
                  <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <mat-icon class="text-white" style="font-size: 32px; width: 32px; height: 32px;">business</mat-icon>
                    </div>
                    <h4 class="text-xl font-semibold text-gray-900 mb-2">Gestión de Empresas</h4>
                    <p class="text-gray-600">Tu aplicación está lista. Ahora puedes gestionar las empresas que tendrán acceso.</p>
                  </div>
                  
                  <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div class="flex items-center mb-4">
                      <mat-icon class="text-green-600 mr-2">check_circle</mat-icon>
                      <h5 class="text-lg font-semibold text-green-800">¡Configuración Completada!</h5>
                    </div>
                    <p class="text-green-700 mb-4">
                      Tu aplicación <strong>{{ guidedFlowApplication?.name }}</strong> ha sido configurada exitosamente.
                    </p>
                    <div class="space-y-2 text-sm text-green-600">
                      <div class="flex items-center">
                        <mat-icon class="mr-2" style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                        Tokens de acceso generados
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="mr-2" style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                        Configuración personalizada aplicada
                      </div>
                      <div class="flex items-center">
                        <mat-icon class="mr-2" style="font-size: 16px; width: 16px; height: 16px;">check</mat-icon>
                        Lista para gestionar empresas
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h6 class="font-semibold text-gray-900 mb-2">Gestionar Empresas</h6>
                      <p class="text-sm text-gray-600 mb-3">Administra qué empresas pueden acceder a tu aplicación.</p>
                      <button class="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                        Ir a Empresas
                      </button>
                    </div>
                    
                    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h6 class="font-semibold text-gray-900 mb-2">Ver Tokens</h6>
                      <p class="text-sm text-gray-600 mb-3">Revisa o regenera los tokens de acceso cuando sea necesario.</p>
                      <button 
                        (click)="guidedFlowStep = 1"
                        class="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200">
                        Ver Tokens
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation buttons -->
              <div class="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  *ngIf="guidedFlowStep > 1"
                  (click)="previousGuidedStep()"
                  class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <mat-icon>chevron_left</mat-icon>
                  Anterior
                </button>
                
                <div class="flex-1"></div>
                
                <div class="flex gap-3">
                  <button
                    (click)="closeGuidedFlow()"
                    class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                  >
                    Cerrar
                  </button>
                  
                  <button
                    *ngIf="guidedFlowStep < 3"
                    (click)="nextGuidedStep()"
                    class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    Siguiente
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                  
                  <button
                    *ngIf="guidedFlowStep === 3"
                    (click)="completeGuidedFlow()"
                    class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <mat-icon>check</mat-icon>
                    Finalizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
    }

    /* Animaciones personalizadas */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeInUp {
      animation: fadeInUp 0.5s ease-out;
    }

    /* Efectos de hover mejorados */
    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    /* Gradientes personalizados */
    .gradient-border {
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #667eea, #764ba2) border-box;
      border: 2px solid transparent;
    }
    .skeleton-row { height: 56px; }
    .skeleton-cell { position: relative; overflow: hidden; }
    .skeleton-cell::after { content: ''; display: block; height: 14px; border-radius: 7px; background: linear-gradient(90deg, #f4f6f8 25%, #eef1f5 37%, #f4f6f8 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
  `]
})
export class AplicacionesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  applications = signal<Application[]>([]);
  
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  skeletonRows = Array.from({ length: 8 });
  
  searchTerm = signal('');
  
  isLoading = signal(false);
  submitting = false;
  
  // Modal states
  showModal = false;
  showTokenModal = false;
  showConfigModal = false;
  isEditing = false;
  editingApplication: Application | null = null;
  
  // Guided flow states
  showGuidedFlow = false;
  guidedFlowStep = 1; // 1: Tokens, 2: Configuration, 3: Companies
  guidedFlowApplication: Application | null = null;
  
  // Token and configuration data
  currentTokenData: TokenData | null = null;
  currentConfigData: any | undefined = undefined;
  
  // Token status tracking
  tokenStatusMap = new Map<string, { isValid: boolean; daysRemaining: number; isExpired: boolean }>();
  tokenValidationInProgress = new Set<string>();
  
  // Form
  applicationForm: FormGroup;
  
  // Math for template
  Math = Math;

  constructor(
    private applicationService: ApplicationService,
    private authTokensService: AuthTokensService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.applicationForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadApplications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true]
    });
  }

  loadApplications(): void {
    this.isLoading.set(true);
    this.applicationService.getApplications(this.currentPage(), this.pageSize(), this.searchTerm())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.applications.set(response.applications);
          this.totalItems.set(response.total);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.isLoading.set(false);
        }
      });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadApplications();
  }

  // Pagination methods
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadApplications();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadApplications();
    }
  }

  // Modal methods
  openCreateModal(): void {
    this.isEditing = false;
    this.editingApplication = null;
    this.applicationForm.reset({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    this.showModal = true;
  }

  editApplication(application: Application): void {
    this.isEditing = true;
    this.editingApplication = application;
    this.applicationForm.patchValue({
      name: application.name,
      code: application.code,
      description: application.description,
      isActive: application.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingApplication = null;
    this.applicationForm.reset();
  }

  onSubmit(): void {
    if (this.applicationForm.valid && !this.submitting) {
      this.submitting = true;

      if (this.isEditing && this.editingApplication) {
        // Update existing application
        this.applicationService.updateApplication(
          parseInt(this.editingApplication.id),
          this.applicationForm.value.name,
          this.applicationForm.value.description,
          this.applicationForm.value.code,
          this.applicationForm.value.isActive
        )
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModal();
              this.loadApplications();
            },
            error: (error) => {
              console.error('Error updating application:', error);
              this.submitting = false;
            }
          });
      } else {
        // Create new application
        this.applicationService.createApplication(
          this.applicationForm.value.name,
          this.applicationForm.value.description,
          this.applicationForm.value.code,
          this.applicationForm.value.isActive
        )
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.submitting = false;
              this.closeModal();
              this.loadApplications();
              
              // Handle the new response structure with AppRegistro tokens
              if (response && response.application) {
                // The backend now automatically creates AppRegistro with tokens
                if (response.tokens) {
                  // Start guided flow with the tokens from the response
                  this.startGuidedFlowWithTokens(response.application, response.tokens);
                } else {
                  // Fallback: try to get tokens via the old method
                  this.generateTokensForNewApplication(response.application.code);
                }
              }
            },
            error: (error) => {
              console.error('Error creating application:', error);
              this.submitting = false;
            }
          });
      }
    }
  }

  startGuidedFlowWithTokens(application: any, tokens: any): void {
    // Start guided flow with tokens from the backend response
    this.guidedFlowApplication = application;
    this.currentTokenData = {
      cCodigoAplicacion: application.code,
      cTokenAcceso: tokens.accessToken || tokens.cAppRegistroTokenAcceso,
      cTokenSecreto: tokens.secretToken || tokens.cAppRegistroSecretoApp,
      dFechaExpiracion: tokens.expirationDate || tokens.dAppRegistroFechaExpiracion,
      bEsActivo: true
    };
    
    this.showGuidedFlow = true;
    this.guidedFlowStep = 1;
  }

  generateTokensForNewApplication(applicationCode: string): void {
    this.authTokensService.generarTokensAplicacion({
      cCodigoAplicacion: applicationCode,
      nDiasValidez: 365 // Default to 1 year
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tokens: TokensAplicacionResponse) => {
          
          // Find the created application
          const createdApp = this.applications().find(app => app.code === applicationCode);
          
          if (createdApp) {
            // Start guided flow
            this.guidedFlowApplication = createdApp;
            this.currentTokenData = {
              cCodigoAplicacion: tokens.cCodigoAplicacion,
              cTokenAcceso: tokens.cTokenAcceso,
              cTokenSecreto: tokens.cTokenSecreto,
              dFechaExpiracion: tokens.dFechaExpiracion,
              bEsActivo: tokens.bEsActivo
            };
            
            this.showGuidedFlow = true;
            this.guidedFlowStep = 1;
          }
        },
        error: (error: any) => {
          console.error('Error generating tokens:', error);
        }
      });
  }

  // Action methods
  toggleStatus(application: Application): void {
    const newStatus = !application.isActive;
    
    this.applicationService.toggleApplicationStatus(parseInt(application.id), newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadApplications();
        },
        error: (error) => {
          console.error('Error toggling application status:', error);
        }
      });
  }

  deleteApplication(application: Application): void {
    if (confirm(`¿Está seguro de que desea eliminar la aplicación "${application.name}"?`)) {
      this.applicationService.deleteApplication(parseInt(application.id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadApplications();
          },
          error: (error) => {
            console.error('Error deleting application:', error);
          }
        });
    }
  }

  // Token methods
  viewTokens(application: Application): void {
    this.authTokensService.getTokensAplicacion(application.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tokens: TokenData[]) => {
          if (tokens && tokens.length > 0) {
            const token = tokens[0]; // Get the first token
            this.currentTokenData = {
              cCodigoAplicacion: token.cCodigoAplicacion,
              cTokenAcceso: token.cTokenAcceso,
              cTokenSecreto: token.cTokenSecreto,
              dFechaExpiracion: token.dFechaExpiracion,
              bEsActivo: token.bEsActivo
            };
          } else {
            this.currentTokenData = null;
          }
          this.showTokenModal = true;
        },
        error: (error: any) => {
          console.error('Error loading tokens:', error);
          this.currentTokenData = null;
          this.showTokenModal = true;
        }
      });
  }

  closeTokenModal(): void {
    this.showTokenModal = false;
    this.currentTokenData = null;
  }

  // Configuration methods
  configureApplication(application: Application): void {
    this.currentConfigData = {
      cNombreConfiguracion: `Configuración ${application.name}`,
      cDescripcionConfiguracion: `Configuración para la aplicación ${application.name}`,
      cTipoConfiguracion: 'desarrollo',
      bConfiguracionActiva: application.isActive
    };
    this.showConfigModal = true;
  }

  closeConfigModal(): void {
    this.showConfigModal = false;
    this.currentConfigData = undefined;
  }

  onConfigurationComplete(configData: any): void {
    console.log('Configuration completed:', configData);
    this.closeConfigModal();
    // Here you would typically save the configuration
  }

  // Guided flow methods
  nextGuidedStep(): void {
    if (this.guidedFlowStep < 3) {
      this.guidedFlowStep++;
      
      if (this.guidedFlowStep === 2 && this.guidedFlowApplication) {
        // Prepare configuration data
        this.currentConfigData = {
          cNombreConfiguracion: `Configuración ${this.guidedFlowApplication.name}`,
          cDescripcionConfiguracion: `Configuración para la aplicación ${this.guidedFlowApplication.name}`,
          cTipoConfiguracion: 'desarrollo',
          bConfiguracionActiva: this.guidedFlowApplication.isActive
        };
      }
    }
  }

  previousGuidedStep(): void {
    if (this.guidedFlowStep > 1) {
      this.guidedFlowStep--;
    }
  }

  closeGuidedFlow(): void {
    this.showGuidedFlow = false;
    this.guidedFlowStep = 1;
    this.guidedFlowApplication = null;
    this.currentTokenData = null;
    this.currentConfigData = undefined;
  }

  completeGuidedFlow(): void {
    this.closeGuidedFlow();
    // Optionally redirect to companies management or show success message
  }

  goTo(section: 'config' | 'users' | 'companies', application: Application): void {
    const appId = parseInt(application.id);
    switch (section) {
      case 'config':
        this.router.navigate(['/admin/configuraciones'], { queryParams: { appId } });
        break;
      case 'users':
        this.router.navigate(['/admin/usuarios-chat'], { queryParams: { appId } });
        break;
      case 'companies':
        this.router.navigate(['/admin/empresas'], { queryParams: { appId } });
        break;
    }
  }

  // Token status methods
  getTokenStatus(applicationId: string): 'valid' | 'invalid' | 'unknown' {
    const status = this.tokenStatusMap.get(applicationId);
    if (!status) return 'unknown';
    
    if (status.isExpired) return 'invalid';
    if (status.isValid) return 'valid';
    return 'invalid';
  }

  getTokenStatusText(applicationId: string): string {
    const status = this.tokenStatusMap.get(applicationId);
    if (!status) return 'Desconocido';
    
    if (status.isExpired) return 'Expirado';
    if (status.isValid) {
      return `Válido (${status.daysRemaining} días)`;
    }
    return 'Inválido';
  }

  getTokenStatusClass(applicationId: string): string {
    const status = this.getTokenStatus(applicationId);
    switch (status) {
      case 'valid':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800';
      case 'invalid':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  }

  refreshTokenStatus(applicationId: string): void {
    const application = this.applications().find(app => app.id === applicationId);
    if (!application) return;

    this.tokenValidationInProgress.add(application.code);
    
    // First get the tokens for this application
    this.authTokensService.getTokensAplicacion(application.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tokens: TokenData[]) => {
          if (tokens && tokens.length > 0) {
            const token = tokens[0]; // Get the first active token
            // Now validate the token
            this.authTokensService.validarAccessToken({
              cCodigoAplicacion: application.code,
              cTokenAcceso: token.cTokenAcceso
            }).pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response: ValidacionTokenResponse) => {
                this.tokenStatusMap.set(applicationId, {
                  isValid: response.bEsValido,
                  daysRemaining: response.nDiasRestantes || 0,
                  isExpired: response.dFechaExpiracion ? new Date(response.dFechaExpiracion) < new Date() : false
                });
                this.tokenValidationInProgress.delete(application.code);
              },
              error: (error: any) => {
                console.error('Error validating token:', error);
                this.tokenValidationInProgress.delete(application.code);
              }
            });
          } else {
            // No tokens found
            this.tokenStatusMap.set(applicationId, {
              isValid: false,
              daysRemaining: 0,
              isExpired: true
            });
            this.tokenValidationInProgress.delete(application.code);
          }
        },
        error: (error: any) => {
          console.error('Error getting tokens:', error);
          this.tokenValidationInProgress.delete(application.code);
        }
      });
  }

  private startTokenValidationTimer(): void {
    // Validate tokens every 5 minutes
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.applications().forEach(app => {
          this.refreshTokenStatus(app.id);
        });
      });
  }
}
