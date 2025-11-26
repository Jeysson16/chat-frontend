import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/infrastructure/services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const token = this.authService.getToken();
      const storedUser = localStorage.getItem('user');
      const appInfoStr = localStorage.getItem('application');

      let empresaId = '';
      let appCode = '';
      let appId = '';
      let clientName = (import.meta.env['NG_APP_NAME'] as string) || 'Chat Frontend';

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // cPerJurCodigo es el ID de empresa
          empresaId = user?.personCode || user?.cPerJurCodigo || '';
        } catch {}
      }

      // Fallback: usar NG_APP_PER_JUR_CODIGO si no hay empresaId en el usuario
      if (!empresaId) {
        const fallbackEmpresaId = '';
        if (fallbackEmpresaId) {
          empresaId = fallbackEmpresaId;
        }
      }

      if (appInfoStr) {
        try {
          const appInfo = JSON.parse(appInfoStr);
          appCode = appInfo?.appCode || appInfo?.code || '';
          appId = appInfo?.id?.toString?.() || '';
        } catch {}
      }

      let headers = req.headers
        .set('x-client-name', clientName);

      if (empresaId) {
        headers = headers.set('x-empresa-id', empresaId);
      }

      if (appCode) {
        headers = headers.set('x-app-code', appCode);
      }

      if (appId) {
        headers = headers.set('x-app-id', appId);
      }

      // Only add authorization if not already present (to avoid conflicts with HybridAuthInterceptor)
      if (token && !req.headers.has('Authorization')) {
        headers = headers.set('authorization', `Bearer ${token}`);
      }

      const cloned = req.clone({ headers });
      return next.handle(cloned);
    } catch {
      return next.handle(req);
    }
  }
}