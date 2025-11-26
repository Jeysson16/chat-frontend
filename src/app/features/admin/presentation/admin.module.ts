import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// Routing
import { AdminRoutingModule } from './admin-routing.module';

// Components
// import { PanelAdminComponent } from './panel-admin/panel-admin.component';
// import { AplicacionesComponent } from './aplicaciones/aplicaciones.component';
// import { ConfiguracionesComponent } from './configuraciones/configuraciones.component';
// import { UsuariosChatComponent } from './usuarios-chat/usuarios-chat.component';
// EmpresasComponent is standalone, imported in routing

@NgModule({
  declarations: [
  ],
  imports: [
    // PanelAdminComponent,
    // AplicacionesComponent,
    // ConfiguracionesComponent,
    // UsuariosChatComponent,
    // EmpresasComponent is standalone
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    
    // Angular Material
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class AdminModule { }