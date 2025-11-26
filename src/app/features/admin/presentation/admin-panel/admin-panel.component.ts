import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { ApplicationService } from '../../infrastructure/services/application.service';
import { CompanyService } from '../../../companies/infrastructure/services/company.service';
import { ChatUserService } from '../../../chat/infrastructure/services/chat-user.service';
import { ConfigurationService } from '../../infrastructure/services/configuration.service';

interface DashboardStats {
  totalAplicaciones: number;
  aplicacionesActivas: number;
  totalEmpresas: number;
  empresasActivas: number;
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosOnline: number;
  totalConfiguraciones: number;
  configuracionesAplicacion: number;
  configuracionesEmpresa: number;
}

interface RecentActivity {
  tipo: 'aplicacion' | 'empresa' | 'usuario' | 'configuracion';
  accion: 'creado' | 'actualizado' | 'eliminado' | 'activado' | 'desactivado';
  descripcion: string;
  fecha: Date;
  usuario?: string;
}

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <!-- Statistics Dashboard -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Main Stats -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Estadísticas del Sistema</h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- Aplicaciones -->
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ stats.totalAplicaciones }}</div>
                <div class="text-sm text-gray-600">Aplicaciones</div>
                <div class="text-xs text-blue-500 mt-1">{{ stats.aplicacionesActivas }} activas</div>
              </div>

              <!-- Empresas -->
              <div class="text-center p-4 bg-orange-50 rounded-lg">
                <div class="text-2xl font-bold text-orange-600">{{ stats.totalEmpresas }}</div>
                <div class="text-sm text-gray-600">Empresas</div>
                <div class="text-xs text-orange-500 mt-1">{{ stats.empresasActivas }} activas</div>
              </div>

              <!-- Usuarios -->
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ stats.totalUsuarios }}</div>
                <div class="text-sm text-gray-600">Usuarios</div>
                <div class="text-xs text-purple-500 mt-1">{{ stats.usuariosOnline }} en línea</div>
              </div>

              <!-- Configuraciones -->
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ stats.totalConfiguraciones }}</div>
                <div class="text-sm text-gray-600">Configuraciones</div>
                <div class="text-xs text-green-500 mt-1">{{ stats.configuracionesAplicacion }} de app</div>
              </div>
            </div>

            <!-- Progress bars -->
            <div class="mt-6 space-y-4">
              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Aplicaciones Activas</span>
                  <span>{{ getPercentage(stats.aplicacionesActivas, stats.totalAplicaciones) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getPercentage(stats.aplicacionesActivas, stats.totalAplicaciones)"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Empresas Activas</span>
                  <span>{{ getPercentage(stats.empresasActivas, stats.totalEmpresas) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getPercentage(stats.empresasActivas, stats.totalEmpresas)"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Usuarios Activos</span>
                  <span>{{ getPercentage(stats.usuariosActivos, stats.totalUsuarios) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    [style.width.%]="getPercentage(stats.usuariosActivos, stats.totalUsuarios)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Info -->
        <div class="space-y-6">
          <!-- System Status -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Servidor Chat</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  Activo
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Base de Datos</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  Conectada
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">SignalR Hub</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  Funcionando
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">API Gateway</span>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                  Operativo
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen Rápido</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Usuarios en línea</span>
                <span class="text-sm font-medium text-gray-900">{{ stats.usuariosOnline }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Configuraciones de empresa</span>
                <span class="text-sm font-medium text-gray-900">{{ stats.configuracionesEmpresa }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Configuraciones de aplicación</span>
                <span class="text-sm font-medium text-gray-900">{{ stats.configuracionesAplicacion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
          <button class="text-blue-600 hover:text-blue-800 text-sm font-medium" disabled>
            Próximamente
          </button>
        </div>

        <div class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Sistema de Auditoría</h3>
          <p class="mt-1 text-sm text-gray-500">El sistema de auditoría y registro de actividad estará disponible próximamente.</p>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
    }
  `]
})
export class PanelAdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  
  stats: DashboardStats = {
    totalAplicaciones: 0,
    aplicacionesActivas: 0,
    totalEmpresas: 0,
    empresasActivas: 0,
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosOnline: 0,
    totalConfiguraciones: 0,
    configuracionesAplicacion: 0,
    configuracionesEmpresa: 0
  };

  recentActivities: RecentActivity[] = [];

  constructor(
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private chatUserService: ChatUserService,
    private configurationService: ConfigurationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentActivity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;

    const apps$ = this.applicationService.getApplications(1, 1000);
    const appsActive$ = this.applicationService.getAplicacionesActivas();
    const companies$ = this.companyService.getEmpresas(1, 1000);
    const companiesActive$ = this.companyService.getEmpresasActivas();
    const usersTotal$ = this.chatUserService.obtenerTotalUsuarios();
    const usersActive$ = this.chatUserService.obtenerTotalUsuariosActivos();
    const usersOnline$ = this.chatUserService.obtenerTotalUsuariosEnLinea();
    const configApp$ = this.configurationService.getConfiguracionesAplicacion(1, 1000);
    const configCompany$ = this.configurationService.getConfiguracionesEmpresa(1, 1000);

    forkJoin({
      apps: apps$,
      appsActive: appsActive$,
      companies: companies$,
      companiesActive: companiesActive$,
      usersTotal: usersTotal$,
      usersActive: usersActive$,
      usersOnline: usersOnline$,
      configApp: configApp$,
      configCompany: configCompany$
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('Dashboard data loaded:', res);
          this.stats = {
            totalAplicaciones: res.apps?.applications?.length ?? 0,
            aplicacionesActivas: res.appsActive?.length ?? 0,
            totalEmpresas: res.companies?.total ?? 0,
            empresasActivas: res.companiesActive?.length ?? 0,
            totalUsuarios: res.usersTotal ?? 0,
            usuariosActivos: res.usersActive ?? 0,
            usuariosOnline: res.usersOnline ?? 0,
            totalConfiguraciones: (res.configApp?.data?.length ?? 0) + (res.configCompany?.data?.length ?? 0),
            configuracionesAplicacion: res.configApp?.data?.length ?? 0,
            configuracionesEmpresa: res.configCompany?.data?.length ?? 0
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.loading = false;
          // Set default values on error
          this.stats = {
            totalAplicaciones: 0,
            aplicacionesActivas: 0,
            totalEmpresas: 0,
            empresasActivas: 0,
            totalUsuarios: 0,
            usuariosActivos: 0,
            usuariosOnline: 0,
            totalConfiguraciones: 0,
            configuracionesAplicacion: 0,
            configuracionesEmpresa: 0
          };
        }
      });
  }

  private loadRecentActivity(): void {
    // For now, we'll show a message indicating that activity tracking will be implemented
    // This removes the mocked data and shows a clean state
    this.recentActivities = [];
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getActivityIconClass(tipo: string): string {
    const classes = {
      aplicacion: 'bg-blue-100 text-blue-600',
      empresa: 'bg-orange-100 text-orange-600',
      usuario: 'bg-purple-100 text-purple-600',
      configuracion: 'bg-green-100 text-green-600'
    };
    return classes[tipo as keyof typeof classes] || 'bg-gray-100 text-gray-600';
  }

  getActivityIconPath(tipo: string): string {
    const paths = {
      aplicacion: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      empresa: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      usuario: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      configuracion: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };
    return paths[tipo as keyof typeof paths] || '';
  }

  getActivityBadgeClass(accion: string): string {
    const classes = {
      creado: 'bg-green-100 text-green-800',
      actualizado: 'bg-blue-100 text-blue-800',
      eliminado: 'bg-red-100 text-red-800',
      activado: 'bg-emerald-100 text-emerald-800',
      desactivado: 'bg-gray-100 text-gray-800'
    };
    return classes[accion as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getActivityActionText(accion: string): string {
    const texts = {
      creado: 'Creado',
      actualizado: 'Actualizado',
      eliminado: 'Eliminado',
      activado: 'Activado',
      desactivado: 'Desactivado'
    };
    return texts[accion as keyof typeof texts] || accion;
  }

  formatActivityDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Hace un momento';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}