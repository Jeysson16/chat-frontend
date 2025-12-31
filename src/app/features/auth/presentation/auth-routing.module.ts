import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { RedirectAuthenticatedGuard } from '../infrastructure/guards/redirect-authenticated.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full'
      },
      {
        path: 'sign-in',
        component: SignInComponent,
        canActivate: [RedirectAuthenticatedGuard]
      },
      {
        path: 'sign-up',
        component: SignUpComponent,
        canActivate: [RedirectAuthenticatedGuard]
      }
    ]
  },
  {
    path: 'role-selection',
    component: RoleSelectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
