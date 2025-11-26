import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ConfigurationService } from '../../infrastructure/services/configuration.service';
import { ApplicationService } from '../../infrastructure/services/application.service';
import { CompanyService } from '../../../companies/infrastructure/services/company.service';
import {
  IConfiguracionAplicacion,
  ICreateConfiguracionAplicacionDto,
  IUpdateConfiguracionAplicacionDto,
  IConfiguracionEmpresa,
  ICreateConfiguracionEmpresaDto,
  IUpdateConfiguracionEmpresaDto,
  IConfiguracionHeredada
} from '../../../../shared/application-configuration.interface';
import { IAplicacion } from '../../../../shared/application.interface';
import { IEmpresaSelect } from '../../../companies/shared/interfaces';

@Component({
  selector: 'app-configuraciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Configuraciones</h1>
          <p class="text-gray-600 mt-1">Gestiona las configuraciones de aplicaciones y empresas</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            (click)="activeTab = 'aplicacion'"
            [class]="activeTab === 'aplicacion' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            Configuraciones de Aplicación
          </button>
          <button
            (click)="activeTab = 'empresa'"
            [class]="activeTab === 'empresa' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            Configuraciones de Empresa
          </button>
          <button
            (click)="activeTab = 'heredadas'"
            [class]="activeTab === 'heredadas' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
          >
            Vista Heredada
          </button>
        </nav>
      </div>

      <!-- Tab: Configuraciones de Aplicación -->
      <div *ngIf="activeTab === 'aplicacion'">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación</label>
              <select
                [(ngModel)]="selectedAplicacionId"
                (change)="onAplicacionChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las aplicaciones</option>
                <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                  {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                </option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                (click)="openCreateAplicacionConfigModal()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Nueva Configuración
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de configuraciones de aplicación -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aplicación
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let config of configuracionesAplicacion" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getAplicacionNombre(config.nAplicacionesId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ config.cConfiguracionAplicacionClave }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {{ config.cConfiguracionAplicacionValor }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ config.cConfiguracionAplicacionTipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="config.bConfiguracionAplicacionEsActiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ config.bConfiguracionAplicacionEsActiva ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button
                        (click)="editConfiguracionAplicacion(config)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        (click)="deleteConfiguracionAplicacion(config)"
                        class="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Configuraciones de Empresa -->
      <div *ngIf="activeTab === 'empresa'">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <select
                [(ngModel)]="selectedEmpresaId"
                (change)="onEmpresaChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las empresas</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nEmpresasId">
                  {{ empresa.cEmpresasNombre }} ({{ empresa.cEmpresasCodigo }})
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación</label>
              <select
                [(ngModel)]="selectedAplicacionIdEmpresa"
                (change)="onEmpresaAplicacionChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las aplicaciones</option>
                <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                  {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                </option>
              </select>
            </div>
            <div class="flex items-end gap-2">
              <button
                (click)="openCreateEmpresaConfigModal()"
                [disabled]="!selectedEmpresaId || !selectedAplicacionIdEmpresa"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Nueva Configuración
              </button>
              <button
                (click)="copiarConfiguracionesAplicacion()"
                [disabled]="!selectedEmpresaId || !selectedAplicacionIdEmpresa"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                title="Copiar configuraciones de aplicación"
              >
                Copiar de App
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla de configuraciones de empresa -->
        <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aplicación
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let config of configuracionesEmpresa" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getEmpresaNombre(config.nEmpresasId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getAplicacionNombre(config.nAplicacionesId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ config.cConfiguracionEmpresaClave }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {{ config.cConfiguracionEmpresaValor }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ config.cConfiguracionEmpresaTipo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="config.bConfiguracionEmpresaEsActiva ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ config.bConfiguracionEmpresaEsActiva ? 'Activa' : 'Inactiva' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button
                        (click)="editConfiguracionEmpresa(config)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        (click)="deleteConfiguracionEmpresa(config)"
                        class="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Vista Heredada -->
      <div *ngIf="activeTab === 'heredadas'">
        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
              <select
                [(ngModel)]="selectedEmpresaIdHeredada"
                (change)="onHeredadaChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empresa</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nEmpresasId">
                  {{ empresa.cEmpresasNombre }} ({{ empresa.cEmpresasCodigo }})
                </option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación *</label>
              <select
                [(ngModel)]="selectedAplicacionIdHeredada"
                (change)="onHeredadaChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar aplicación</option>
                <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                  {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tabla de configuraciones heredadas -->
        <div *ngIf="selectedEmpresaIdHeredada && selectedAplicacionIdHeredada" class="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clave
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Aplicación
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Empresa
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let config of configuracionesHeredadas" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ config.clave }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {{ config.valorAplicacion }}
                  </td>
                  <td class="px-6 py-4 text-sm max-w-xs truncate">
                    <span *ngIf="config.valorEmpresa" [class]="config.esPersonalizada ? 'text-blue-600 font-medium' : 'text-gray-500'">
                      {{ config.valorEmpresa }}
                    </span>
                    <span *ngIf="!config.valorEmpresa" class="text-gray-400 italic">
                      Usa valor de aplicación
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ config.tipoConfiguracion }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [class]="config.esPersonalizada ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ config.esPersonalizada ? 'Personalizada' : 'Por defecto' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>

    <!-- Modal para configuración de aplicación -->
    <div *ngIf="showModalAplicacion" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditingAplicacion ? 'Editar Configuración de Aplicación' : 'Nueva Configuración de Aplicación' }}
          </h3>
          
          <form [formGroup]="configAplicacionForm" (ngSubmit)="onSubmitAplicacion()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Aplicación *</label>
              <select
                formControlName="nAplicacionesId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar aplicación</option>
                <option *ngFor="let app of aplicaciones" [value]="app.nAplicacionesId">
                  {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Clave *</label>
              <input
                type="text"
                formControlName="cConfiguracionAplicacionClave"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Clave de configuración"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <textarea
                formControlName="cConfiguracionAplicacionValor"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valor de configuración"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                formControlName="cConfiguracionAplicacionTipo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                formControlName="cConfiguracionAplicacionDescripcion"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la configuración"
              ></textarea>
            </div>

            <div class="mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="bConfiguracionAplicacionEsActiva"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Configuración activa</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                (click)="closeModalAplicacion()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="configAplicacionForm.invalid || submitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {{ submitting ? 'Guardando...' : (isEditingAplicacion ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal para configuración de empresa -->
    <div *ngIf="showModalEmpresa" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ isEditingEmpresa ? 'Editar Configuración de Empresa' : 'Nueva Configuración de Empresa' }}
          </h3>
          
          <form [formGroup]="configEmpresaForm" (ngSubmit)="onSubmitEmpresa()">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
              <select
                formControlName="nEmpresasId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar empresa</option>
                <option *ngFor="let empresa of empresas" [value]="empresa.nEmpresasId">
                  {{ empresa.cEmpresasNombre }} ({{ empresa.cEmpresasCodigo }})
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
                  {{ app.cAplicacionesNombre }} ({{ app.cAplicacionesCodigo }})
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Clave *</label>
              <input
                type="text"
                formControlName="cConfiguracionEmpresaClave"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Clave de configuración"
              >
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
              <textarea
                formControlName="cConfiguracionEmpresaValor"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valor de configuración"
              ></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select
                formControlName="cConfiguracionEmpresaTipo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="json">JSON</option>
                <option value="url">URL</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                formControlName="cConfiguracionEmpresaDescripcion"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la configuración"
              ></textarea>
            </div>

            <div class="mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="bConfiguracionEmpresaEsActiva"
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                >
                <span class="ml-2 text-sm text-gray-700">Configuración activa</span>
              </label>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                (click)="closeModalEmpresa()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="configEmpresaForm.invalid || submitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              >
                {{ submitting ? 'Guardando...' : (isEditingEmpresa ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
    }
  `]
})
export class ConfiguracionesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Tabs
  activeTab: 'aplicacion' | 'empresa' | 'heredadas' = 'aplicacion';

  // Data
  aplicaciones: IAplicacion[] = [];
  empresas: IEmpresaSelect[] = [];
  configuracionesAplicacion: IConfiguracionAplicacion[] = [];
  configuracionesEmpresa: IConfiguracionEmpresa[] = [];
  configuracionesHeredadas: IConfiguracionHeredada[] = [];

  // Filters
  selectedAplicacionId: number | null = null;
  selectedEmpresaId: number | null = null;
  selectedAplicacionIdEmpresa: number | null = null;
  selectedEmpresaIdHeredada: number | null = null;
  selectedAplicacionIdHeredada: number | null = null;

  // Loading states
  loading = false;
  submitting = false;

  // Modals
  showModalAplicacion = false;
  showModalEmpresa = false;
  isEditingAplicacion = false;
  isEditingEmpresa = false;
  editingConfigAplicacion: IConfiguracionAplicacion | null = null;
  editingConfigEmpresa: IConfiguracionEmpresa | null = null;

  // Forms
  configAplicacionForm: FormGroup;
  configEmpresaForm: FormGroup;

  constructor(
    private configurationService: ConfigurationService,
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.configAplicacionForm = this.createAplicacionForm();
    this.configEmpresaForm = this.createEmpresaForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.route.queryParamMap.subscribe(params => {
      const appId = params.get('appId');
      if (appId) {
        this.activeTab = 'aplicacion';
        this.selectedAplicacionId = +appId;
        this.loadConfiguracionesAplicacion();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createAplicacionForm(): FormGroup {
    return this.fb.group({
      nAplicacionesId: ['', [Validators.required]],
      cConfiguracionAplicacionClave: ['', [Validators.required, Validators.maxLength(100)]],
      cConfiguracionAplicacionValor: ['', [Validators.required]],
      cConfiguracionAplicacionTipo: ['', [Validators.required]],
      cConfiguracionAplicacionDescripcion: ['', [Validators.maxLength(500)]],
      bConfiguracionAplicacionEsActiva: [true]
    });
  }

  private createEmpresaForm(): FormGroup {
    return this.fb.group({
      nEmpresasId: ['', [Validators.required]],
      nAplicacionesId: ['', [Validators.required]],
      cConfiguracionEmpresaClave: ['', [Validators.required, Validators.maxLength(100)]],
      cConfiguracionEmpresaValor: ['', [Validators.required]],
      cConfiguracionEmpresaTipo: ['', [Validators.required]],
      cConfiguracionEmpresaDescripcion: ['', [Validators.maxLength(500)]],
      bConfiguracionEmpresaEsActiva: [true]
    });
  }

  private loadInitialData(): void {
    this.loading = true;

    forkJoin({
      aplicaciones: this.applicationService.getAplicacionesActivas(),
      empresas: this.companyService.getEmpresasActivas()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.aplicaciones = data.aplicaciones;
          this.empresas = data.empresas;
          this.loadConfiguracionesAplicacion();
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.loading = false;
        }
      });
  }

  loadConfiguracionesAplicacion(): void {
    const source$ = this.selectedAplicacionId
      ? this.configurationService.getConfiguracionesAplicacion(1, 100, this.selectedAplicacionId)
      : this.configurationService.getConfiguracionesAplicacionPorCodigoFromStorage();
    source$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.configuracionesAplicacion = response.data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading configuraciones aplicacion:', error);
          this.loading = false;
        }
      });
  }

  loadConfiguracionesEmpresa(): void {
    this.configurationService.getConfiguracionesEmpresa(
      1, 
      100, 
      this.selectedEmpresaId || undefined, 
      this.selectedAplicacionIdEmpresa || undefined
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.configuracionesEmpresa = response.data;
        },
        error: (error) => {
          console.error('Error loading configuraciones empresa:', error);
        }
      });
  }

  loadConfiguracionesHeredadas(): void {
    if (this.selectedEmpresaIdHeredada && this.selectedAplicacionIdHeredada) {
      this.configurationService.getConfiguracionesHeredadas(
        this.selectedEmpresaIdHeredada,
        this.selectedAplicacionIdHeredada
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (configuraciones) => {
            this.configuracionesHeredadas = configuraciones;
          },
          error: (error) => {
            console.error('Error loading configuraciones heredadas:', error);
          }
        });
    }
  }

  onAplicacionChange(): void {
    this.loadConfiguracionesAplicacion();
  }

  onEmpresaChange(): void {
    this.loadConfiguracionesEmpresa();
  }

  onEmpresaAplicacionChange(): void {
    this.loadConfiguracionesEmpresa();
  }

  onHeredadaChange(): void {
    this.loadConfiguracionesHeredadas();
  }

  getAplicacionNombre(id: number): string {
    const app = this.aplicaciones.find(a => a.nAplicacionesId === id);
    return app ? `${app.cAplicacionesNombre} (${app.cAplicacionesCodigo})` : 'N/A';
  }

  getEmpresaNombre(id: number): string {
    const empresa = this.empresas.find(e => e.nEmpresasId === id);
    return empresa ? `${empresa.cEmpresasNombre} (${empresa.cEmpresasCodigo})` : 'N/A';
  }

  // Configuraciones de Aplicación
  openCreateAplicacionConfigModal(): void {
    this.isEditingAplicacion = false;
    this.editingConfigAplicacion = null;
    this.configAplicacionForm.reset({
      nAplicacionesId: this.selectedAplicacionId || '',
      cConfiguracionAplicacionClave: '',
      cConfiguracionAplicacionValor: '',
      cConfiguracionAplicacionTipo: '',
      cConfiguracionAplicacionDescripcion: '',
      bConfiguracionAplicacionEsActiva: true
    });
    this.showModalAplicacion = true;
  }

  editConfiguracionAplicacion(config: IConfiguracionAplicacion): void {
    this.isEditingAplicacion = true;
    this.editingConfigAplicacion = config;
    this.configAplicacionForm.patchValue(config);
    this.showModalAplicacion = true;
  }

  closeModalAplicacion(): void {
    this.showModalAplicacion = false;
    this.isEditingAplicacion = false;
    this.editingConfigAplicacion = null;
    this.configAplicacionForm.reset();
  }

  onSubmitAplicacion(): void {
    if (this.configAplicacionForm.valid) {
      this.submitting = true;

      if (this.isEditingAplicacion && this.editingConfigAplicacion) {
        const updateDto: IUpdateConfiguracionAplicacionDto = {
          nConfiguracionAplicacionId: this.editingConfigAplicacion.nConfiguracionAplicacionId,
          ...this.configAplicacionForm.value
        };

        this.configurationService.updateConfiguracionAplicacion(updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModalAplicacion();
              this.loadConfiguracionesAplicacion();
            },
            error: (error) => {
              console.error('Error updating configuracion aplicacion:', error);
              this.submitting = false;
            }
          });
      } else {
        const createDto: ICreateConfiguracionAplicacionDto = this.configAplicacionForm.value;

        this.configurationService.createConfiguracionAplicacion(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModalAplicacion();
              this.loadConfiguracionesAplicacion();
            },
            error: (error) => {
              console.error('Error creating configuracion aplicacion:', error);
              this.submitting = false;
            }
          });
      }
    }
  }

  deleteConfiguracionAplicacion(config: IConfiguracionAplicacion): void {
    if (confirm(`¿Está seguro de que desea eliminar la configuración "${config.cConfiguracionAplicacionClave}"?`)) {
      this.configurationService.deleteConfiguracionAplicacion(config.nConfiguracionAplicacionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadConfiguracionesAplicacion();
          },
          error: (error) => {
            console.error('Error deleting configuracion aplicacion:', error);
          }
        });
    }
  }

  // Configuraciones de Empresa
  openCreateEmpresaConfigModal(): void {
    this.isEditingEmpresa = false;
    this.editingConfigEmpresa = null;
    this.configEmpresaForm.reset({
      nEmpresasId: this.selectedEmpresaId || '',
      nAplicacionesId: this.selectedAplicacionIdEmpresa || '',
      cConfiguracionEmpresaClave: '',
      cConfiguracionEmpresaValor: '',
      cConfiguracionEmpresaTipo: '',
      cConfiguracionEmpresaDescripcion: '',
      bConfiguracionEmpresaEsActiva: true
    });
    this.showModalEmpresa = true;
  }

  editConfiguracionEmpresa(config: IConfiguracionEmpresa): void {
    this.isEditingEmpresa = true;
    this.editingConfigEmpresa = config;
    this.configEmpresaForm.patchValue(config);
    this.showModalEmpresa = true;
  }

  closeModalEmpresa(): void {
    this.showModalEmpresa = false;
    this.isEditingEmpresa = false;
    this.editingConfigEmpresa = null;
    this.configEmpresaForm.reset();
  }

  onSubmitEmpresa(): void {
    if (this.configEmpresaForm.valid) {
      this.submitting = true;

      if (this.isEditingEmpresa && this.editingConfigEmpresa) {
        const updateDto: IUpdateConfiguracionEmpresaDto = {
          nConfiguracionEmpresaId: this.editingConfigEmpresa.nConfiguracionEmpresaId,
          ...this.configEmpresaForm.value
        };

        this.configurationService.updateConfiguracionEmpresa(updateDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModalEmpresa();
              this.loadConfiguracionesEmpresa();
            },
            error: (error) => {
              console.error('Error updating configuracion empresa:', error);
              this.submitting = false;
            }
          });
      } else {
        const createDto: ICreateConfiguracionEmpresaDto = this.configEmpresaForm.value;

        this.configurationService.createConfiguracionEmpresa(createDto)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.submitting = false;
              this.closeModalEmpresa();
              this.loadConfiguracionesEmpresa();
            },
            error: (error) => {
              console.error('Error creating configuracion empresa:', error);
              this.submitting = false;
            }
          });
      }
    }
  }

  deleteConfiguracionEmpresa(config: IConfiguracionEmpresa): void {
    if (confirm(`¿Está seguro de que desea eliminar la configuración "${config.cConfiguracionEmpresaClave}"?`)) {
      this.configurationService.deleteConfiguracionEmpresa(config.nConfiguracionEmpresaId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadConfiguracionesEmpresa();
          },
          error: (error) => {
            console.error('Error deleting configuracion empresa:', error);
          }
        });
    }
  }

  copiarConfiguracionesAplicacion(): void {
    if (this.selectedEmpresaId && this.selectedAplicacionIdEmpresa) {
      if (confirm('¿Está seguro de que desea copiar las configuraciones de la aplicación a esta empresa?')) {
        this.configurationService.copiarConfiguracionesAplicacionAEmpresa(
          this.selectedAplicacionIdEmpresa,
          this.selectedEmpresaId
        ).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadConfiguracionesEmpresa();
            },
            error: (error) => {
              console.error('Error copying configuraciones:', error);
            }
          });
      }
    }
  }
}
