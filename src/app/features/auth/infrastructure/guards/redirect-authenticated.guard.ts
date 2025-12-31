import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectAuthenticatedGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      switchMap(isAuth => {
        if (!isAuth) {
          return of(true);
        }
        const user = this.authService.getCurrentUserValue();
        const role = user?.role ? String(user.role).toLowerCase() : '';
        if (role === 'admin' || role === 'administrator' || role === 'super_admin') {
          return of(this.router.createUrlTree(['/auth/role-selection']));
        }
        return of(this.router.createUrlTree(['/chat']));
      }),
      catchError(() => of(true))
    );
  }
}
