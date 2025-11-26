import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex">
      <!-- Panel izquierdo con información del sistema -->
      <div class="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <div class="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <!-- Logo SICOM -->
          <div class="mb-8">
            <img src="/images/logo/logo.svg" alt="SICOM Logo" class="h-16 w-auto filter brightness-0 invert mb-4">
          </div>
          
          <h1 class="text-4xl font-bold mb-4 text-center">SISTEMA SICOM MODULAR</h1>
          <p class="text-xl mb-12 text-center opacity-90">
            Plataforma de comunicación empresarial moderna, segura y eficiente para equipos de trabajo
          </p>
          
          <!-- Características destacadas -->
          <div class="space-y-6 w-full max-w-md">
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-lg">Comunicación segura y cifrada</span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <span class="text-lg">Gestión avanzada de contactos</span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-lg">Mensajería en tiempo real</span>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-lg">Sincronización en la nube</span>
            </div>
          </div>
        </div>
        
        <!-- Elementos decorativos -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>
      
      <!-- Panel derecho con formulario -->
      <div class="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuthLayoutComponent { }