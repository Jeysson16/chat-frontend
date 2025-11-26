import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IEmpresa,
  ICreateEmpresaDto,
  IUpdateEmpresaDto,
  IEmpresaResponse,
  IEmpresaSelect
} from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5406/api'}/v1/empresas`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las empresas con paginación
   */
  getEmpresas(page: number = 1, limit: number = 10, search?: string): Observable<IEmpresaResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<IEmpresaResponse>(this.baseUrl, { params });
  }

  /**
   * Obtener una empresa por ID
   */
  getEmpresaById(id: number): Observable<IEmpresa> {
    return this.http.get<IEmpresa>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener una empresa por código
   */
  getEmpresaByCodigo(codigo: string): Observable<IEmpresa> {
    return this.http.get<IEmpresa>(`${this.baseUrl}/codigo/${codigo}`);
  }

  /**
   * Crear una nueva empresa
   */
  createEmpresa(empresa: ICreateEmpresaDto): Observable<IEmpresa> {
    return this.http.post<IEmpresa>(this.baseUrl, empresa);
  }

  /**
   * Actualizar una empresa existente
   */
  updateEmpresa(empresa: IUpdateEmpresaDto): Observable<IEmpresa> {
    return this.http.put<IEmpresa>(`${this.baseUrl}/${empresa.nEmpresasId}`, empresa);
  }

  /**
   * Eliminar una empresa (soft delete)
   */
  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activar/Desactivar una empresa
   */
  toggleEmpresaStatus(id: number, esActiva: boolean): Observable<IEmpresa> {
    return this.http.patch<IEmpresa>(`${this.baseUrl}/${id}/status`, { bEmpresasEsActiva: esActiva });
  }

  /**
   * Obtener empresas activas para selects
   */
  getEmpresasActivas(): Observable<IEmpresaSelect[]> {
    return this.http.get<IEmpresaSelect[]>(`${this.baseUrl}/activas`);
  }

  /**
   * Obtener empresas por aplicación
   */
  getEmpresasByAplicacion(aplicacionId: number): Observable<IEmpresaSelect[]> {
    return this.http.get<IEmpresaSelect[]>(`${this.baseUrl}/aplicacion/${aplicacionId}`);
  }

  /**
   * Verificar si un código de empresa está disponible
   */
  verificarCodigoDisponible(codigo: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('codigo', codigo);
    
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }

    return this.http.get<{ disponible: boolean }>(`${this.baseUrl}/verificar-codigo`, { params });
  }

  /**
   * Verificar si un email de empresa está disponible
   */
  verificarEmailDisponible(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    let params = new HttpParams().set('email', email);
    
    if (excludeId) {
      params = params.set('excludeId', excludeId.toString());
    }

    return this.http.get<{ disponible: boolean }>(`${this.baseUrl}/verificar-email`, { params });
  }

  /**
   * Buscar empresas por término
   */
  buscarEmpresas(termino: string): Observable<IEmpresaSelect[]> {
    const params = new HttpParams().set('q', termino);
    return this.http.get<IEmpresaSelect[]>(`${this.baseUrl}/buscar`, { params });
  }

  /**
   * Obtener estadísticas de empresa
   */
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