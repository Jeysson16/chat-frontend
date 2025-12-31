import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Application } from '../../domain/entities/application.entity';
import { ApplicationDataAdapter } from '../adapters/application-data.adapter';
import {
  IAplicacion,
  ICreateAplicacionDto,
  IUpdateAplicacionDto,
  IAplicacionResponse
} from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL}/v1/aplicaciones`;

  constructor(
    private http: HttpClient,
    private adapter: ApplicationDataAdapter
  ) {}

  /**
   * Get all applications with pagination
   */
  getApplications(page: number = 1, limit: number = 10, search?: string): Observable<{ applications: Application[], total: number, page: number, limit: number }> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        const items = Array.isArray(res)
          ? res
          : (res.lstItem ?? res.listItem ?? res.data ?? res.items ?? []);
        const applications = (items as any[]).map(dto => new Application(
          (dto.nAplicacionesId ?? dto.id ?? '').toString(),
          dto.cAplicacionesNombre ?? dto.name ?? '',
          dto.cAplicacionesDescripcion ?? dto.description ?? '',
          dto.cAplicacionesCodigo ?? dto.code ?? '',
          dto.bAplicacionesEsActiva !== undefined ? dto.bAplicacionesEsActiva : (dto.isActive ?? true),
          new Date(dto.dAplicacionesFechaCreacion ?? dto.dAplicacionesFechaRegistro ?? dto.createdAt ?? Date.now()),
          new Date(dto.dAplicacionesFechaModificacion ?? dto.dAplicacionesFechaActualizacion ?? dto.updatedAt ?? Date.now())
        ));
        const inferredTotal = Array.isArray(items) ? (items as any[]).length : 0;
        const total = res?.pagination?.total ?? res?.total ?? inferredTotal;
        const currentPage = res?.pagination?.page ?? res?.page ?? page;
        const currentLimit = res?.pagination?.limit ?? res?.limit ?? limit;
        return { applications, total, page: currentPage, limit: currentLimit };
      })
    );
  }

  /**
   * Get application by ID
   */
  getApplicationById(id: number): Observable<Application> {
    return this.http.get<IAplicacion>(`${this.baseUrl}/${id}`).pipe(
      map(dto => this.adapter.adaptToEntity(dto))
    );
  }

  /**
   * Get application by code
   */
  getApplicationByCode(code: string): Observable<Application> {
    return this.http.get<IAplicacion>(`${this.baseUrl}/codigo/${code}`).pipe(
      map(dto => this.adapter.adaptToEntity(dto))
    );
  }

  /**
   * Create a new application
   */
  createApplication(name: string, description: string, code: string, isActive: boolean = true): Observable<{ application: Application; tokens?: any }> {
    const createDto = this.adapter.adaptCreateDto(name, description, code, isActive);
    return this.http.post<any>(this.baseUrl, createDto).pipe(
      map(response => {
        const payload = response?.item ?? response?.data ?? response;
        return this.adapter.adaptCreateResponse(payload);
      })
    );
  }

  /**
   * Update an existing application
   */
  updateApplication(id: number, name?: string, description?: string, code?: string, isActive?: boolean): Observable<Application> {
    const updateDto = this.adapter.adaptUpdateDto(id, name, description, code, isActive);
    return this.http.put<IAplicacion>(`${this.baseUrl}/${id}`, updateDto).pipe(
      map(dto => this.adapter.adaptToEntity(dto))
    );
  }

  /**
   * Delete an application (soft delete)
   */
  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Toggle application status
   */
  toggleApplicationStatus(id: number, isActive: boolean): Observable<Application> {
    // Primero obtener la aplicación actual para tener todos los datos
    return this.getApplicationById(id).pipe(
      switchMap(application => {
        // Usar el endpoint PUT existente para actualizar la aplicación completa con el nuevo estado
        const updateDto = this.adapter.adaptUpdateDto(
          id,
          application.name,
          application.description,
          application.code,
          isActive
        );
        return this.http.put<IAplicacion>(`${this.baseUrl}/${id}`, updateDto).pipe(
          map(dto => this.adapter.adaptToEntity(dto))
        );
      })
    );
  }

  /**
   * Get active applications for selects
   */
  getActiveApplications(): Observable<Application[]> {
    return this.http.get<IAplicacion[]>(`${this.baseUrl}/activas`).pipe(
      map(dtos => this.adapter.adaptToEntities(dtos))
    );
  }

  /**
   * Alias para compatibilidad - Get active applications (Spanish method name)
   */
  getAplicacionesActivas(): Observable<IAplicacion[]> {
    return this.http.get<any>(`${this.baseUrl}/activas`).pipe(
      map(res => {
        const items = Array.isArray(res)
          ? res
          : (res.lstItem ?? res.LstItem ?? res.listItem ?? res.items ?? res.data ?? []);
        return Array.isArray(items) ? (items as IAplicacion[]) : [];
      })
    );
  }

  /**
   * Check if application code is available
   */
  checkCodeAvailability(code: string, excludeId?: number): Observable<{ available: boolean }> {
    // Usar el endpoint existente para obtener por código y verificar disponibilidad
    return this.http.get<IAplicacion>(`${this.baseUrl}/codigo/${code}`).pipe(
      map(application => {
        // Si encontramos una aplicación con ese código
        if (excludeId && application.nAplicacionesId === excludeId) {
          // Si el ID encontrado es el mismo que estamos excluyendo, está disponible
          return { available: true };
        }
        // Si encontramos una aplicación y no es la que estamos excluyendo, no está disponible
        return { available: false };
      }),
      // Si no se encuentra (404), el código está disponible
      catchError(() => [{ available: true }])
    );
  }

  /**
   * Get applications with extended data (including code) for component usage
   */
  getApplicationsWithCode(page: number = 1, limit: number = 10, search?: string): Observable<{ applications: Application[], total: number, page: number, limit: number }> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        const items = Array.isArray(res)
          ? res
          : (res.lstItem ?? res.listItem ?? res.data ?? res.items ?? []);
        const applications = (items as any[]).map(dto => new Application(
          (dto.nAplicacionesId ?? dto.id ?? '').toString(),
          dto.cAplicacionesNombre ?? dto.name ?? '',
          dto.cAplicacionesDescripcion ?? dto.description ?? '',
          dto.cAplicacionesCodigo ?? dto.code ?? '',
          dto.bAplicacionesEsActiva !== undefined ? dto.bAplicacionesEsActiva : (dto.isActive ?? true),
          new Date(dto.dAplicacionesFechaCreacion ?? dto.dAplicacionesFechaRegistro ?? dto.createdAt ?? Date.now()),
          new Date(dto.dAplicacionesFechaModificacion ?? dto.dAplicacionesFechaActualizacion ?? dto.updatedAt ?? Date.now())
        ));
        const inferredTotal = Array.isArray(items) ? (items as any[]).length : 0;
        const total = res?.pagination?.total ?? res?.total ?? inferredTotal;
        const currentPage = res?.pagination?.page ?? res?.page ?? page;
        const currentLimit = res?.pagination?.limit ?? res?.limit ?? limit;
        return { applications, total, page: currentPage, limit: currentLimit };
      })
    );
  }
}
