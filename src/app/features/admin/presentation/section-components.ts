import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Gestión de Aplicaciones</h2>
        <p class="text-gray-600">Aquí podrás gestionar todas las aplicaciones del sistema de chat.</p>
        
        <div class="mt-6">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p class="mt-1 text-sm text-gray-500">La gestión de aplicaciones estará disponible pronto.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ApplicationsComponent {}

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Configuraciones del Sistema</h2>
        <p class="text-gray-600">Aquí podrás configurar las opciones del sistema de chat.</p>
        
        <div class="mt-6">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p class="mt-1 text-sm text-gray-500">Las configuraciones del sistema estarán disponibles pronto.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfigurationsComponent {}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Gestión de Usuarios</h2>
        <p class="text-gray-600">Aquí podrás gestionar los usuarios del sistema de chat.</p>
        
        <div class="mt-6">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p class="mt-1 text-sm text-gray-500">La gestión de usuarios estará disponible pronto.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {}

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Gestión de Empresas</h2>
        <p class="text-gray-600">Aquí podrás gestionar las empresas del sistema de chat.</p>
        
        <div class="mt-6">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Funcionalidad en desarrollo</h3>
            <p class="mt-1 text-sm text-gray-500">La gestión de empresas estará disponible pronto.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CompaniesComponent {}