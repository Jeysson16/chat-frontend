import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../../features/auth/infrastructure/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          console.log('User not authenticated, redirecting to login');
          return this.router.createUrlTree(['/auth/sign-in']);
        }
      }),
      catchError(error => {
        console.error('Auth guard error:', error);
        return of(this.router.createUrlTree(['/auth/sign-in']));
      })
    );
  }
}