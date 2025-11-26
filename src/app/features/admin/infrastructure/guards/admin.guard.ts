import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const isAuthenticated = await this.authService.isAuthenticated();
    
    if (!isAuthenticated) {
      this.router.navigate(['/auth/sign-in'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }

    const currentUser = this.authService.getCurrentUserValue();
    
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'administrator')) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}