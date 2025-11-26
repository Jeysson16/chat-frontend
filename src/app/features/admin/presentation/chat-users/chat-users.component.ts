import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, takeUntil } from 'rxjs';
import { IAplicacion } from '../../../../shared/application.interface';
import {
  IBuscarUsuarioChatDto,
  ICreateUsuarioChatDto,
  IUpdateUsuarioChatDto,
  IUsuarioChat,
  IUsuarioChatExtendido
} from '../../../../shared/chat-user.interface';
import { ChatUserService } from '../../../chat/infrastructure/services/chat-user.service';
import { CompanyService } from '../../../companies/infrastructure/services/company.service';
import { IEmpresaSelect } from '../../../companies/shared/interfaces';
import { ApplicationService } from '../../infrastructure/services/application.service';

@Component({
  selector: 'app-usuarios-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatMenuModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Usuarios de Chat</h1>
          <p class="text-gray-600 mt-1">Gestiona los usuarios que pueden acceder al chat</p>
        </div>
        <button
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event); onSearchChange()"
              placeholder="Nombre, email o código..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              [ngModel]="selectedEmpresaId()"
              (ngModelChange)="selectedEmpresaId.set($event ? +$event : null); onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las empresas</option>
              <option *ngFor="let empresa of empresas" [value]="empresa.nEmpresasId">
                {{ empresa.cEmpresasNombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación</label>
            <select
              [ngModel]="selectedAplicacionId()"
              (ngModelChange)="selectedAplicacionId.set($event ? +$event : null); onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las aplicaciones</option>
              <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                {{ app.cAplicacionesNombre }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              [ngModel]="selectedEstado()"
              (ngModelChange)="selectedEstado.set($event); onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="online">En línea</option>
              <option value="offline">Desconectados</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.totalUsuarios }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Activos</p>
              <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.usuariosActivos }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">En Línea</p>
              <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.usuariosOnline }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Conversaciones Hoy</p>
              <p class="text-2xl font-semibold text-gray-900">{{ estadisticas.conversacionesHoy }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aplicación
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actividad
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversaciones
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let usuario of usuarios()" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ getInitials(usuario.cUsuariosNombre) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ usuario.cUsuariosNombre }}</div>
                      <div class="text-sm text-gray-500">{{ usuario.cUsuariosEmail }}</div>
                      <div class="text-xs text-gray-400">{{ usuario.cUsuariosCodigo }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getEmpresaNombre(usuario.nEmpresasId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ getAplicacionNombre(usuario.nAplicacionesId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1">
                    <span 
                      [class]="usuario.bUsuariosEsActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ usuario.bUsuariosEsActivo ? 'Activo' : 'Inactivo' }}
                    </span>
                    <span 
                      [class]="usuario.cUsuariosEstado === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ usuario.cUsuariosEstado === 'online' ? 'En línea' : 'Desconectado' }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(usuario.dUsuariosFechaUltimaActividad) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex flex-col">
                    <span class="font-medium">{{ usuario.nTotalConversaciones || 0 }}</span>
                    <span class="text-xs text-gray-500">{{ usuario.nMensajesEnviados || 0 }} mensajes</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="hidden md:flex justify-end gap-2">
                    <button (click)="viewUserDetails(usuario)" class="text-blue-600 hover:text-blue-900" title="Ver detalles">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button (click)="editUser(usuario)" class="text-blue-600 hover:text-blue-900" title="Editar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button (click)="toggleUserStatus(usuario)" [class]="usuario.bUsuariosEsActivo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'" [title]="usuario.bUsuariosEsActivo ? 'Desactivar' : 'Activar'">
                      <svg *ngIf="usuario.bUsuariosEsActivo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path></svg>
                      <svg *ngIf="!usuario.bUsuariosEsActivo" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                    <button (click)="deleteUser(usuario)" class="text-red-600 hover:text-red-900" title="Eliminar">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                  <div class="md:hidden flex justify-end">
                    <button [matMenuTriggerFor]="userMenu" class="p-2 rounded-md text-gray-600 hover:bg-gray-100">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                    </button>
                    <mat-menu #userMenu="matMenu">
                      <button mat-menu-item (click)="viewUserDetails(usuario)"><mat-icon>visibility</mat-icon><span>Ver detalles</span></button>
                      <button mat-menu-item (click)="editUser(usuario)"><mat-icon>edit</mat-icon><span>Editar</span></button>
                      <button mat-menu-item (click)="toggleUserStatus(usuario)"><mat-icon>toggle_on</mat-icon><span>{{ usuario.bUsuariosEsActivo ? 'Desactivar' : 'Activar' }}</span></button>
                      <button mat-menu-item (click)="deleteUser(usuario)"><mat-icon>delete</mat-icon><span>Eliminar</span></button>
                    </mat-menu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              (click)="previousPage()"
              [disabled]="currentPage() === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              (click)="nextPage()"
              [disabled]="currentPage() >= totalPages()"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  (click)="previousPage()"
                  [disabled]="currentPage() === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button
                  *ngFor="let page of getVisiblePages()"
                  (click)="goToPage(page)"
                  [class]="page === currentPage() ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>

                <button
                  (click)="nextPage()"
                  [disabled]="currentPage() >= totalPages()"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading()" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div *ngIf="isLoading()" class="px-4 pb-6">
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
    </div>

    <!-- Modal para crear/editar usuario -->
    <div *ngIf="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h3>
          
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input
                type="text"
                formControlName="cUsuariosCodigo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Código único del usuario"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                formControlName="cUsuariosNombre"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                formControlName="cUsuariosEmail"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="correo@ejemplo.com"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
              <select
                formControlName="nEmpresasId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empresa</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nEmpresasId">
                  {{ empresa.cEmpresasNombre }}
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación *</label>
              <select
                formControlName="nAplicacionesId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar aplicación</option>
                <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                  {{ app.cAplicacionesNombre }}
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                formControlName="cUsuariosRol"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="usuario">Usuario</option>
                <option value="moderador">Moderador</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="bUsuariosEsActivo"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="userForm.invalid || submitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {{ submitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de detalles del usuario -->
    <div *ngIf="showDetailsModal && selectedUser" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">Detalles del Usuario</h3>
            <button
              (click)="closeDetailsModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Información básica -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Información Básica</h4>
              <div class="space-y-2">
                <div><span class="font-medium">Código:</span> {{ selectedUser.cUsuariosCodigo }}</div>
                <div><span class="font-medium">Nombre:</span> {{ selectedUser.cUsuariosNombre }}</div>
                <div><span class="font-medium">Email:</span> {{ selectedUser.cUsuariosEmail }}</div>
                <div><span class="font-medium">Rol:</span> {{ selectedUser.cUsuariosRol }}</div>
                <div><span class="font-medium">Estado:</span> 
                  <span [class]="selectedUser.bUsuariosEsActivo ? 'text-green-600' : 'text-red-600'">
                    {{ selectedUser.bUsuariosEsActivo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Información de empresa y aplicación -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Empresa y Aplicación</h4>
              <div class="space-y-2">
                <div><span class="font-medium">Empresa:</span> {{ getEmpresaNombre(selectedUser.nEmpresasId) }}</div>
                <div><span class="font-medium">Aplicación:</span> {{ getAplicacionNombre(selectedUser.nAplicacionesId) }}</div>
              </div>
            </div>

            <!-- Actividad -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Actividad</h4>
              <div class="space-y-2">
                <div><span class="font-medium">Estado de conexión:</span> 
                  <span [class]="selectedUser.cUsuariosEstado === 'online' ? 'text-green-600' : 'text-gray-600'">
                    {{ selectedUser.cUsuariosEstado === 'online' ? 'En línea' : 'Desconectado' }}
                  </span>
                </div>
                <div><span class="font-medium">Última actividad:</span> {{ formatDate(selectedUser.dUsuariosFechaUltimaActividad) }}</div>
                <div><span class="font-medium">Fecha de registro:</span> {{ formatDate(selectedUser.dUsuariosFechaCreacion) }}</div>
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Estadísticas</h4>
              <div class="space-y-2">
                <div><span class="font-medium">Total conversaciones:</span> {{ selectedUser.nTotalConversaciones || 0 }}</div>
                <div><span class="font-medium">Mensajes enviados:</span> {{ selectedUser.nMensajesEnviados || 0 }}</div>
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
    .skeleton-row { height: 56px; }
    .skeleton-cell { position: relative; overflow: hidden; }
    .skeleton-cell::after { content: ''; display: block; height: 14px; border-radius: 7px; background: linear-gradient(90deg, #f4f6f8 25%, #eef1f5 37%, #f4f6f8 63%); background-size: 400% 100%; animation: shimmer 1.2s ease-in-out infinite; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
  `]
})
export class UsuariosChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  usuarios = signal<IUsuarioChatExtendido[]>([]);
  aplicaciones: IAplicacion[] = [];
  empresas: IEmpresaSelect[] = [];
  estadisticas = {
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosOnline: 0,
    conversacionesHoy: 0
  };

  searchTerm = signal('');
  selectedEmpresaId = signal<number | null>(null);
  selectedAplicacionId = signal<number | null>(null);
  selectedEstado = signal('');

  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  skeletonRows = Array.from({ length: 8 });

  isLoading = signal(false);
  submitting = false;

  // Modal states
  showModal = false;
  showDetailsModal = false;
  isEditing = false;
  editingUser: IUsuarioChat | null = null;
  selectedUser: IUsuarioChatExtendido | null = null;

  // Form
  userForm: FormGroup;

  constructor(
    private chatUserService: ChatUserService,
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createUserForm();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.route.queryParamMap.subscribe(params => {
      const appId = params.get('appId');
      if (appId) {
        this.selectedAplicacionId.set(+appId);
        this.onFilterChange();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      cUsuariosCodigo: ['', [Validators.required, Validators.maxLength(50)]],
      cUsuariosNombre: ['', [Validators.required, Validators.maxLength(100)]],
      cUsuariosEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      nEmpresasId: ['', [Validators.required]],
      nAplicacionesId: ['', [Validators.required]],
      cUsuariosRol: ['usuario'],
      bUsuariosEsActivo: [true]
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage.set(1);
      this.loadUsuarios();
    });
  }

  private loadInitialData(): void {
    this.isLoading.set(true);

    forkJoin({
      aplicaciones: this.applicationService.getAplicacionesActivas(),
      empresas: this.companyService.getEmpresasActivas()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.aplicaciones = data.aplicaciones;
          this.empresas = data.empresas;
          this.loadUsuarios();
          this.loadEstadisticas();
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.isLoading.set(false);
        }
      });
  }

  loadUsuarios(): void {
    const estadoActual = this.selectedEstado();
    const estadoVal: 'online' | 'offline' | 'away' | 'busy' | undefined =
      estadoActual === 'online' || estadoActual === 'offline' || estadoActual === 'away' || estadoActual === 'busy'
        ? (estadoActual as 'online' | 'offline' | 'away' | 'busy')
        : undefined;

    const buscarDto: IBuscarUsuarioChatDto = {
      cTerminoBusqueda: this.searchTerm() || undefined,
      nEmpresasId: this.selectedEmpresaId() || undefined,
      nAplicacionesId: this.selectedAplicacionId() || undefined,
      cUsuariosEstado: estadoVal,
      bUsuariosEsActivo: estadoActual === 'activo' ? true : estadoActual === 'inactivo' ? false : undefined
    };

    this.isLoading.set(true);
    this.chatUserService.buscarUsuariosChat(buscarDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.usuarios.set(response);
          this.totalItems.set(response.length);
          this.isLoading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading usuarios:', error);
          this.isLoading.set(false);
        }
      });
  }

  loadEstadisticas(): void {
    // Crear estadísticas mock por ahora
    this.estadisticas = {
      totalUsuarios: this.usuarios().length,
      usuariosActivos: this.usuarios().filter(u => u.bUsuariosEsActivo).length,
      usuariosOnline: this.usuarios().filter(u => u.cUsuariosEstado === 'online').length,
      conversacionesHoy: 0
    };
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm());
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsuarios();
  }

  // Pagination
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
      this.loadUsuarios();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadUsuarios();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadUsuarios();
  }

  getVisiblePages(): number[] {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, this.currentPage() - delta); 
         i <= Math.min(this.totalPages() - 1, this.currentPage() + delta); 
         i++) {
      range.push(i);
    }

    if (this.currentPage() - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage() + delta < this.totalPages() - 1) {
      rangeWithDots.push(-1, this.totalPages());
    } else {
      rangeWithDots.push(this.totalPages());
    }

    return rangeWithDots.filter(page => page > 0);
  }

  // User actions
  openCreateModal(): void {
    this.isEditing = false;
    this.editingUser = null;
    this.userForm.reset({
      cUsuariosCodigo: '',
      cUsuariosNombre: '',
      cUsuariosEmail: '',
      nEmpresasId: '',
      nAplicacionesId: '',
      cUsuariosRol: 'usuario',
      bUsuariosEsActivo: true
    });
    this.showModal = true;
  }

  editUser(user: IUsuarioChat): void {
    this.isEditing = true;
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingUser = null;
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.submitting = true;

      if (this.isEditing && this.editingUser) {
        const updateDto: IUpdateUsuarioChatDto = {
          ...this.userForm.value
        };

        this.chatUserService.updateUsuario(this.editingUser!.nUsuariosId, updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModal();
              this.loadUsuarios();
              this.loadEstadisticas();
            },
            error: (error: any) => {
              console.error('Error updating user:', error);
              this.submitting = false;
            }
          });
      } else {
        const createDto: ICreateUsuarioChatDto = this.userForm.value;

        this.chatUserService.createUsuario(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModal();
              this.loadUsuarios();
              this.loadEstadisticas();
            },
            error: (error: any) => {
              console.error('Error creating user:', error);
              this.submitting = false;
            }
          });
      }
    }
  }

  viewUserDetails(user: IUsuarioChatExtendido): void {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }

  toggleUserStatus(user: IUsuarioChat): void {
    const action = user.bUsuariosEsActivo ? 'desactivar' : 'activar';
    if (confirm(`¿Está seguro de que desea ${action} al usuario "${user.cUsuariosNombre}"?`)) {
      this.chatUserService.toggleEstadoUsuario(user.nUsuariosId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsuarios();
            this.loadEstadisticas();
          },
          error: (error: any) => {
            console.error('Error toggling user status:', error);
          }
        });
    }
  }

  deleteUser(user: IUsuarioChat): void {
    if (confirm(`¿Está seguro de que desea eliminar al usuario "${user.cUsuariosNombre}"? Esta acción no se puede deshacer.`)) {
      this.chatUserService.deleteUsuario(user.nUsuariosId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsuarios();
            this.loadEstadisticas();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
          }
        });
    }
  }

  // Utility methods
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getEmpresaNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const empresa = this.empresas.find(e => e.nEmpresasId === id);
    return empresa ? empresa.cEmpresasNombre : 'N/A';
  }

  getAplicacionNombre(id: number | undefined): string {
    if (!id) return 'N/A';
    const aplicacion = this.aplicaciones.find(a => a.nAplicacionesId === id);
    return aplicacion ? aplicacion.cAplicacionesNombre : 'N/A';
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  Math = Math;
}