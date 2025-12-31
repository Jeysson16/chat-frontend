import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStatsDto {
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

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL}/v1/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStatsDto> {
    return new Observable<DashboardStatsDto>((subscriber) => {
      this.http.get<any>(this.baseUrl).subscribe({
        next: (res) => {
          const payload = res?.item ?? res?.data ?? res;
          subscriber.next(payload as DashboardStatsDto);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }
}
