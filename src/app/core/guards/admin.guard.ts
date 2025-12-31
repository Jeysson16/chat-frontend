import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../features/auth/infrastructure/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          console.log('User not authenticated, redirecting to login');
          return of(this.router.createUrlTree(['/auth/sign-in']));
        }

        // Si está autenticado, verificar el rol
        return this.authService.currentUser$.pipe(
          map(user => {
            if (user && this.isAdminUser(user)) {
              return true;
            } else {
              console.log('User does not have admin privileges, redirecting to chat');
              return this.router.createUrlTree(['/chat']);
            }
          })
        );
      }),
      catchError(error => {
        console.error('Admin guard error:', error);
        return of(this.router.createUrlTree(['/auth/sign-in']));
      })
    );
  }

  private isAdminUser(user: any): boolean {
    const role = (user && user.role) ? String(user.role).toLowerCase() : '';
    const adminRoles = ['admin', 'administrator', 'super_admin'];
    return adminRoles.includes(role);
  }
}
