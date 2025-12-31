import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    IConfiguracionAplicacionEntityResponse,
    ICreateConfiguracionAplicacionEntityDto,
    IUpdateConfiguracionAplicacionEntityDto
} from '../../domain/entities/configuracion-aplicacion.entity';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationEntityService {
  private apiUrl = `${import.meta.env.NG_APP_API_URL}/v1/configuracion-aplicacion`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la configuración de una aplicación específica
   * Como solo puede haber una configuración por aplicación, retorna un solo objeto
   */
  getConfiguracionByAplicacion(nAplicacionesId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${nAplicacionesId}`);
  }

  /**
   * Crea una nueva configuración para una aplicación
   * Solo se puede crear si no existe una configuración previa para la aplicación
   */
  createConfiguracion(dto: ICreateConfiguracionAplicacionEntityDto): Observable<IConfiguracionAplicacionEntityResponse> {
    return this.http.post<IConfiguracionAplicacionEntityResponse>(this.apiUrl, dto);
  }

  /**
   * Actualiza la configuración existente de una aplicación
   */
  updateConfiguracion(
    nAplicacionesId: number, 
    dto: IUpdateConfiguracionAplicacionEntityDto
  ): Observable<IConfiguracionAplicacionEntityResponse> {
    return this.http.put<IConfiguracionAplicacionEntityResponse>(`${this.apiUrl}/${nAplicacionesId}`, dto);
  }

  /**
   * Verifica si una aplicación tiene configuración
   */
  existeConfiguracion(nAplicacionesId: number): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/${nAplicacionesId}/existe`);
  }
}
