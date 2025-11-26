import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IUsuarioChat,
  ICreateUsuarioChatDto,
  IUpdateUsuarioChatDto,
  IUsuarioChatResponse,
  IBuscarUsuarioChatDto,
  IUsuarioChatExtendido
} from '../../../../shared/chat-user.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatUserService {
  private readonly baseUrl = `${import.meta.env.NG_APP_API_URL}/v1/usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los usuarios de chat con paginación
   */
  getUsuariosChat(page: number = 1, limit: number = 10, filtros?: IBuscarUsuarioChatDto): Observable<IUsuarioChatResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filtros) {
      if (filtros.cTerminoBusqueda) {
        params = params.set('search', filtros.cTerminoBusqueda);
      }
      if (filtros.nEmpresasId) {
        params = params.set('empresaId', filtros.nEmpresasId.toString());
      }
      if (filtros.nAplicacionesId) {
        params = params.set('aplicacionId', filtros.nAplicacionesId.toString());
      }
      if (filtros.cUsuariosEstado) {
        params = params.set('estado', filtros.cUsuariosEstado);
      }
      if (filtros.bUsuariosEsActivo !== undefined) {
        params = params.set('esActivo', filtros.bUsuariosEsActivo.toString());
      }
    }

    return this.http.get<IUsuarioChatResponse>(this.baseUrl, { params });
  }

  /**
   * Obtener un usuario de chat por ID
   */
  getUsuarioChatById(id: number): Observable<IUsuarioChatExtendido> {
    return this.http.get<IUsuarioChatExtendido>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtener usuario de chat por email
   */
  getUsuarioChatByEmail(email: string): Observable<IUsuarioChat> {
    return this.http.get<IUsuarioChat>(`${this.baseUrl}/email/${email}`);
  }

  /**
   * Crear un nuevo usuario de chat
   */
  createUsuarioChat(usuario: ICreateUsuarioChatDto): Observable<IUsuarioChat> {
    return this.http.post<IUsuarioChat>(this.baseUrl, usuario);
  }

  /**
   * Actualizar un usuario de chat existente
   */
  updateUsuarioChat(id: number, usuario: IUpdateUsuarioChatDto): Observable<IUsuarioChat> {
    return this.http.put<IUsuarioChat>(`${this.baseUrl}/${id}`, usuario);
  }

  /**
   * Eliminar un usuario de chat (soft delete)
   */
  deleteUsuarioChat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activar/Desactivar un usuario de chat
   */
  toggleUsuarioChatStatus(id: number, esActivo: boolean): Observable<IUsuarioChat> {
    return this.http.patch<IUsuarioChat>(`${this.baseUrl}/${id}/status`, { bUsuariosEsActivo: esActivo });
  }

  /**
   * Actualizar estado de usuario (online, offline, away, busy)
   */
  updateEstadoUsuario(id: number, estado: 'online' | 'offline' | 'away' | 'busy'): Observable<IUsuarioChat> {
    return this.http.patch<IUsuarioChat>(`${this.baseUrl}/${id}/estado`, { cUsuariosEstado: estado });
  }

  /**
   * Buscar usuarios de chat
   */
  buscarUsuariosChat(filtros: IBuscarUsuarioChatDto): Observable<IUsuarioChat[]> {
    // Adaptar filtros al DTO del backend (BuscarUsuarioDto)
    const body: any = {
      cTerminoBusqueda: filtros.cTerminoBusqueda,
      nEmpresasId: filtros.nEmpresasId,
      nAplicacionesId: filtros.nAplicacionesId,
      cUsuariosEstado: filtros.cUsuariosEstado,
      bUsuariosEsActivo: filtros.bUsuariosEsActivo
    };

    return this.http.post<any[]>(`${this.baseUrl}/buscar`, body).pipe(
      map((dtos) => dtos.map((dto) => this.adaptUsuarioDto(dto)))
    );
  }

  /**
   * Adaptador de DTO backend (UsuarioDto) a interfaz frontend (IUsuarioChat)
   */
  private adaptUsuarioDto(dto: any): IUsuarioChat {
    return {
      nUsuariosId: dto.nUsuariosId ?? 0,
      cUsuariosNombre: dto.cUsuariosNombre ?? dto.cUsuariosChatNombre ?? '',
      cUsuariosEmail: dto.cUsuariosEmail ?? dto.cUsuariosChatEmail ?? '',
      cUsuariosCodigo: dto.cUsuariosChatUsername ?? dto.cUsuariosChatId ?? '',
      cUsuariosAvatar: dto.cUsuariosChatAvatar ?? '',
      cUsuariosEstado: dto.bUsuariosEstaEnLinea ? 'online' : 'offline',
      cUsuariosRol: dto.cUsuariosChatRol ?? '',
      nEmpresasId: dto.nUsuariosEmpresaId ?? undefined,
      nAplicacionesId: dto.nUsuariosAplicacionId ?? undefined,
      dUsuariosFechaCreacion: dto.dUsuariosFechaCreacion ?? undefined,
      dUsuariosFechaUltimaActividad: dto.dUsuariosUltimaConexion ?? undefined,
      bUsuariosEsActivo: dto.bUsuariosActivo ?? dto.bUsuariosChatEstaActivo ?? false,
    };
  }

  /**
   * Existencias y estadísticas (endpoints extra del Swagger)
   */
  existePorEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe/email/${encodeURIComponent(email)}`);
  }

  existePorUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe/username/${encodeURIComponent(username)}`);
  }

  existePorCodigo(codigo: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe/codigo/${encodeURIComponent(codigo)}`);
  }

  obtenerEstadisticas(id: string): Observable<{
    usuarioId: string;
    totalMensajes: number;
    totalContactos: number;
    ultimaConexion?: string;
    conversacionesActivas: number;
    conversacionesArchivadas: number;
    tokensActivos: number;
    tokensRevocados: number;
  }> {
    return this.http.get<any>(`${this.baseUrl}/${id}/estadisticas`);
  }

  obtenerTotalUsuarios(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/estadisticas/total`);
  }

  obtenerTotalUsuariosActivos(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/estadisticas/activos`);
  }

  obtenerTotalUsuariosEnLinea(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/estadisticas/en-linea`);
  }

  /**
   * Obtener usuarios activos por empresa
   */
  getUsuariosActivosByEmpresa(empresaId: number): Observable<IUsuarioChat[]> {
    return this.http.get<IUsuarioChat[]>(`${this.baseUrl}/empresa/${empresaId}/activos`);
  }

  /**
   * Obtener usuarios activos por aplicación
   */
  getUsuariosActivosByAplicacion(aplicacionId: number): Observable<IUsuarioChat[]> {
    return this.http.get<IUsuarioChat[]>(`${this.baseUrl}/aplicacion/${aplicacionId}/activos`);
  }

  /**
   * Verificar si un email está disponible
   */
  verificarEmailDisponible(email: string, excludeId?: number): Observable<{ disponible: boolean }> {
    return this.existePorEmail(email).pipe(
      map((existe) => ({ disponible: !existe }))
    );
  }

  /**
   * Obtener estadísticas de usuario
   */
  getEstadisticasUsuario(id: number): Observable<{
    totalConversaciones: number;
    conversacionesActivas: number;
    totalMensajes: number;
    mensajesEnviados: number;
    mensajesRecibidos: number;
    ultimaActividad: Date;
  }> {
    return this.http.get<{
      totalConversaciones: number;
      conversacionesActivas: number;
      totalMensajes: number;
      mensajesEnviados: number;
      mensajesRecibidos: number;
      ultimaActividad: Date;
    }>(`${this.baseUrl}/${id}/estadisticas`);
  }

  /**
   * Actualizar última actividad del usuario
   */
  actualizarUltimaActividad(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/ultima-conexion`, {});
  }

  /**
   * Activar/Desactivar estado de usuario (alias para compatibilidad)
   */
  toggleEstadoUsuario(id: number): Observable<IUsuarioChat> {
    return this.http.patch<IUsuarioChat>(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  /**
   * Eliminar usuario (alias para compatibilidad)
   */
  deleteUsuario(id: number): Observable<void> {
    return this.deleteUsuarioChat(id);
  }

  /**
   * Crear usuario (alias para compatibilidad)
   */
  createUsuario(usuario: ICreateUsuarioChatDto): Observable<IUsuarioChat> {
    return this.createUsuarioChat(usuario);
  }

  /**
   * Actualizar usuario (alias para compatibilidad)
   */
  updateUsuario(id: number, usuario: IUpdateUsuarioChatDto): Observable<IUsuarioChat> {
    return this.updateUsuarioChat(id, usuario);
  }
}