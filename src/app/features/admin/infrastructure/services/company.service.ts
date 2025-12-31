import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IEmpresa,
  IEmpresaSelect
} from '../../domain/entities/company.interfaces';
import { Company, CompanyCreate, CompanyUpdate } from '../../domain/models/company.model';
import { CompanyDataAdapter } from '../adapters/company-data.adapter';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5406/api'}/v1/empresas`;
  private readonly adapter = new CompanyDataAdapter();

  constructor(private http: HttpClient) {}

  getEmpresas(page: number = 1, limit: number = 10, search?: string): Observable<{ data: Company[]; total: number; page: number; limit: number }> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) params = params.set('search', search);
    return this.http.get<any>(this.baseUrl, { params }).pipe(
      map(res => {
        const entities = this.adapter.normalizeListResponse(res);
        const models = entities.map((e: IEmpresa) => this.adapter.toModel(e));
        const total = res?.total ?? models.length;
        const pageNum = res?.page ?? page;
        const limitNum = res?.limit ?? limit;
        return { data: models, total, page: pageNum, limit: limitNum };
      })
    );
  }

  getEmpresaById(id: number): Observable<Company> {
    return this.http.get<IEmpresa>(`${this.baseUrl}/${id}`).pipe(map(e => this.adapter.toModel(e)));
  }

  getEmpresaByCodigo(codigo: string): Observable<Company> {
    return this.http.get<IEmpresa>(`${this.baseUrl}/codigo/${codigo}`).pipe(map(e => this.adapter.toModel(e)));
  }

  createEmpresa(model: CompanyCreate): Observable<Company> {
    const body = this.adapter.buildCreateRequest(model);
    return this.http.post<IEmpresa>(this.baseUrl, body).pipe(map(e => this.adapter.toModel(e)));
  }

  updateEmpresa(model: CompanyUpdate): Observable<Company> {
    const body = this.adapter.buildUpdateRequest(model);
    return this.http.put<IEmpresa>(`${this.baseUrl}/${body.nEmpresasId}`, body).pipe(map(e => this.adapter.toModel(e)));
  }

  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleEmpresaStatus(id: number, esActiva: boolean): Observable<Company> {
    return this.http.patch<IEmpresa>(`${this.baseUrl}/${id}/status`, { bEmpresasEsActiva: esActiva }).pipe(map(e => this.adapter.toModel(e)));
  }

  getEmpresasActivas(): Observable<IEmpresaSelect[]> {
    return this.http.get<any>(`${this.baseUrl}/activas`).pipe(
      map(res => {
        const raw = Array.isArray(res) ? res : (res.lstItem ?? res.LstItem ?? res.listItem ?? res.items ?? res.data ?? []);
        const arr: any[] = Array.isArray(raw) ? raw : [];
        return arr.map(x => ({
          nEmpresasId: x.nEmpresasId ?? x.EmpresasId ?? x.id ?? 0,
          cEmpresasNombre: x.cEmpresasNombre ?? x.EmpresasNombre ?? x.nombre ?? '',
          cEmpresasCodigo: x.cEmpresasCodigo ?? x.EmpresasCodigo ?? x.codigo ?? '',
          bEmpresasEsActiva: x.bEmpresasEsActiva ?? x.EmpresasActiva ?? x.activa ?? true
        } as IEmpresaSelect));
      })
    );
  }

  getEmpresasByAplicacion(aplicacionId: number): Observable<IEmpresaSelect[]> {
    return this.http.get<any>(`${this.baseUrl}/aplicacion/${aplicacionId}`).pipe(
      map(res => {
        const raw = Array.isArray(res) ? res : (res.lstItem ?? res.LstItem ?? res.listItem ?? res.items ?? res.data ?? []);
        const arr: any[] = Array.isArray(raw) ? raw : [];
        return arr.map(x => ({
          nEmpresasId: x.nEmpresasId ?? x.EmpresasId ?? x.id ?? 0,
          cEmpresasNombre: x.cEmpresasNombre ?? x.EmpresasNombre ?? x.nombre ?? '',
          cEmpresasCodigo: x.cEmpresasCodigo ?? x.EmpresasCodigo ?? x.codigo ?? '',
          bEmpresasEsActiva: x.bEmpresasEsActiva ?? x.EmpresasActiva ?? x.activa ?? true
        } as IEmpresaSelect));
      })
    );
  }

  verificarCodigoDisponible(codigo: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('codigo', codigo);
    if (excludeId) params = params.set('excludeId', excludeId.toString());
    return this.http.get<{ disponible: boolean }>(`${this.baseUrl}/verificar-codigo`, { params });
  }

  verificarEmailDisponible(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('email', email);
    if (excludeId) params = params.set('excludeId', excludeId.toString());
    return this.http.get<{ disponible: boolean }>(`${this.baseUrl}/verificar-email`, { params });
  }

  buscarEmpresas(termino: string): Observable<IEmpresaSelect[]> {
    const params = new HttpParams().set('q', termino);
    return this.http.get<IEmpresaSelect[]>(`${this.baseUrl}/buscar`, { params });
  }

  getEstadisticasEmpresa(id: number): Observable<{
    totalUsuarios: number;
    usuariosActivos: number;
    totalConversaciones: number;
    conversacionesActivas: number;
    totalMensajes: number;
    mensajesHoy: number;
  }> {
    return this.http.get<{
      totalUsuarios: number;
      usuariosActivos: number;
      totalConversaciones: number;
      conversacionesActivas: number;
      totalMensajes: number;
      mensajesHoy: number;
    }>(`${this.baseUrl}/${id}/estadisticas`);
  }
}
