import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of, switchMap, catchError } from 'rxjs';
import { CompanyService } from '../../../admin/infrastructure/services/company.service';
import { ConfigurationService } from '../../../admin/infrastructure/services/configuration.service';

@Injectable({ providedIn: 'root' })
export class ChatConfigResolver implements Resolve<any> {
  constructor(private companyService: CompanyService, private configService: ConfigurationService) {}

  resolve(): Observable<any> {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      const storedApp = JSON.parse(localStorage.getItem('application') || sessionStorage.getItem('application') || '{}');
      const companyCode = storedUser?.cPerJurCodigo || storedUser?.companyId || storedUser?.empresaCodigo;
      const appId = Number(storedApp?.id || 0);
      if (!companyCode || !appId) return of({ effective: [], empresaId: 0, aplicacionId: appId });
      return this.companyService.getEmpresaByCodigo(companyCode).pipe(
        switchMap((empresa: any) => {
          const empresaId = Number(empresa?.nEmpresasId || empresa?.id || 0);
          if (!empresaId) return of({ effective: [], empresaId: 0, aplicacionId: appId });
          return this.configService.getConfiguracionesByEmpresaYAplicacion(empresaId, appId).pipe(
            catchError(() => of([])),
            switchMap((lst) => of({ effective: lst || [], empresaId, aplicacionId: appId }))
          );
        })
      );
    } catch {
      return of({ effective: [], empresaId: 0, aplicacionId: 0 });
    }
  }
}

