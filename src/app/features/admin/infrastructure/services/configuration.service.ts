import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IConfiguracionAplicacion,
  ICreateConfiguracionAplicacionDto,
  IUpdateConfiguracionAplicacionDto,
  IConfiguracionAplicacionResponse,
  IConfiguracionAplicacionAgrupada,
  IConfiguracionEmpresa,
  ICreateConfiguracionEmpresaDto,
  IUpdateConfiguracionEmpresaDto,
  IConfiguracionEmpresaResponse,
  IConfiguracionEmpresaAgrupada,
  IConfiguracionHeredada
} from '../../../../shared/application-configuration.interface';
import { StorageService } from '../../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL || 'http://localhost:5278/api'}/v1`;

  constructor(private http: HttpClient, private storage: StorageService) {}

  // ==================== CONFIGURACIONES DE APLICACIÓN ====================

  /**
   * Obtener configuraciones de aplicación con paginación
   */
  getConfiguracionesAplicacion(page: number = 1, limit: number = 10, aplicacionId?: number): Observable<IConfiguracionAplicacionResponse> {
    if (aplicacionId) {
      return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/${aplicacionId}`);
    }

    const app = this.storage.getApplication();
    if (app?.code) {
      return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/por-codigo/${app.code}`);
    }
    if (app?.id) {
      return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/${app.id}`);
    }
    return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/por-codigo/SICOM_CHAT_2024`);
  }

  /**
   * Obtener configuraciones de aplicación utilizando el código guardado en local storage
   */
  getConfiguracionesAplicacionPorCodigoFromStorage(): Observable<IConfiguracionAplicacionResponse> {
    const app = this.storage.getApplication();
    if (app?.code) {
      return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/por-codigo/${app.code}`);
    }
    return this.http.get<IConfiguracionAplicacionResponse>(`${this.baseUrl}/configuracion-aplicacion/por-codigo/SICOM_CHAT_2024`);
  }

  /**
   * Obtener configuraciones agrupadas por aplicación
   */
  getConfiguracionesAplicacionAgrupadas(): Observable<IConfiguracionAplicacionAgrupada[]> {
    return this.http.get<IConfiguracionAplicacionAgrupada[]>(`${this.baseUrl}/configuracion-aplicacion/agrupadas`);
  }

  /**
   * Obtener configuración de aplicación por ID
   */
  getConfiguracionAplicacionById(id: number): Observable<IConfiguracionAplicacion> {
    return this.http.get<IConfiguracionAplicacion>(`${this.baseUrl}/configuracion-aplicacion/${id}`);
  }

  /**
   * Obtener configuraciones por aplicación ID
   */
  getConfiguracionesByAplicacionId(aplicacionId: number): Observable<IConfiguracionAplicacion[]> {
    return this.http.get<IConfiguracionAplicacion[]>(`${this.baseUrl}/configuracion-aplicacion/${aplicacionId}`);
  }

  /**
   * Crear nueva configuración de aplicación
   */
  createConfiguracionAplicacion(configuracion: ICreateConfiguracionAplicacionDto): Observable<IConfiguracionAplicacion> {
    return this.http.post<IConfiguracionAplicacion>(`${this.baseUrl}/configuracion-aplicacion`, configuracion);
  }

  /**
   * Actualizar configuración de aplicación
   */
  updateConfiguracionAplicacion(configuracion: IUpdateConfiguracionAplicacionDto): Observable<IConfiguracionAplicacion> {
    return this.http.put<IConfiguracionAplicacion>(`${this.baseUrl}/configuracion-aplicacion/${configuracion.nConfiguracionAplicacionId}`, configuracion);
  }

  /**
   * Eliminar configuración de aplicación
   */
  deleteConfiguracionAplicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/configuracion-aplicacion/${id}`);
  }

  // ==================== CONFIGURACIONES DE EMPRESA ====================

  /**
   * Obtener configuraciones de empresa con paginación
   */
  getConfiguracionesEmpresa(page: number = 1, limit: number = 10, empresaId?: number, aplicacionId?: number): Observable<IConfiguracionEmpresaResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (empresaId) {
      params = params.set('empresaId', empresaId.toString());
    }

    if (aplicacionId) {
      params = params.set('aplicacionId', aplicacionId.toString());
    }

    return this.http.get<IConfiguracionEmpresaResponse>(`${this.baseUrl}/configuracion-empresa`, { params });
  }

  /**
   * Obtener configuraciones agrupadas por empresa y aplicación
   */
  getConfiguracionesEmpresaAgrupadas(): Observable<IConfiguracionEmpresaAgrupada[]> {
    return this.http.get<IConfiguracionEmpresaAgrupada[]>(`${this.baseUrl}/configuracion-empresa/agrupadas`);
  }

  /**
   * Obtener configuración de empresa por ID
   */
  getConfiguracionEmpresaById(id: number): Observable<IConfiguracionEmpresa> {
    return this.http.get<IConfiguracionEmpresa>(`${this.baseUrl}/configuracion-empresa/${id}`);
  }

  /**
   * Obtener configuraciones por empresa y aplicación
   */
  getConfiguracionesByEmpresaYAplicacion(empresaId: number, aplicacionId: number): Observable<IConfiguracionEmpresa[]> {
    return this.http.get<IConfiguracionEmpresa[]>(`${this.baseUrl}/configuracion-empresa/empresa/${empresaId}/aplicacion/${aplicacionId}`);
  }

  /**
   * Obtener configuraciones heredadas (aplicación + empresa)
   */
  getConfiguracionesHeredadas(empresaId: number, aplicacionId: number): Observable<IConfiguracionHeredada[]> {
    return this.http.get<IConfiguracionHeredada[]>(`${this.baseUrl}/configuracion-empresa/heredadas/empresa/${empresaId}/aplicacion/${aplicacionId}`);
  }

  /**
   * Crear nueva configuración de empresa
   */
  createConfiguracionEmpresa(configuracion: ICreateConfiguracionEmpresaDto): Observable<IConfiguracionEmpresa> {
    return this.http.post<IConfiguracionEmpresa>(`${this.baseUrl}/configuracion-empresa`, configuracion);
  }

  /**
   * Actualizar configuración de empresa
   */
  updateConfiguracionEmpresa(configuracion: IUpdateConfiguracionEmpresaDto): Observable<IConfiguracionEmpresa> {
    return this.http.put<IConfiguracionEmpresa>(`${this.baseUrl}/configuracion-empresa/${configuracion.nConfiguracionEmpresaId}`, configuracion);
  }

  /**
   * Eliminar configuración de empresa
   */
  deleteConfiguracionEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/configuracion-empresa/${id}`);
  }

  // ==================== MÉTODOS UTILITARIOS ====================

  /**
   * Copiar configuraciones de aplicación a empresa
   */
  copiarConfiguracionesAplicacionAEmpresa(aplicacionId: number, empresaId: number): Observable<IConfiguracionEmpresa[]> {
    return this.http.post<IConfiguracionEmpresa[]>(`${this.baseUrl}/configuracion-empresa/copiar-aplicacion-a-empresa`, {
      nAplicacionesId: aplicacionId,
      nEmpresasId: empresaId
    });
  }

  /**
   * Resetear configuraciones de empresa a valores por defecto de aplicación
   */
  resetearConfiguracionesEmpresa(empresaId: number, aplicacionId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/configuracion-empresa/resetear-empresa`, {
      nEmpresasId: empresaId,
      nAplicacionesId: aplicacionId
    });
  }

  /**
   * Verificar si una clave de configuración existe
   */
  verificarClaveConfiguracion(clave: string, aplicacionId: number, empresaId?: number): Observable<{ existe: boolean }> {
    let params = new HttpParams()
      .set('clave', clave)
      .set('aplicacionId', aplicacionId.toString());

    if (empresaId) {
      params = params.set('empresaId', empresaId.toString());
    }

    return this.http.get<{ existe: boolean }>(`${this.baseUrl}/configuracion-empresa/verificar-clave`, { params });
  }
}
