import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin-panel/admin-panel.component').then(m => m.PanelAdminComponent)
      },
      {
        path: 'aplicaciones',
        loadComponent: () => import('./applications/applications.component').then(m => m.AplicacionesComponent)
      },
      {
        path: 'configuraciones',
        loadComponent: () => import('./configurations/configurations.component').then(m => m.ConfigurationsComponent)
      },
      {
        path: 'usuarios-chat',
        loadComponent: () => import('./chat-users/chat-users.component').then(m => m.UsuariosChatComponent)
      },
      {
        path: 'empresas',
        loadComponent: () => import('./companies/companies.component').then(m => m.EmpresasComponent)
      },
      {
        path: 'empresas/:empresaId/configuraciones',
        loadComponent: () => import('./company-configurations/company-configurations.component').then(m => m.CompanyConfigurationsComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
