import { Injectable } from '@angular/core';
import { Application, AppRegistroTokens } from '../../domain/entities/application.entity';

@Injectable({
  providedIn: 'root'
})
export class ApplicationDataAdapter {
  adaptToExtendedEntity(dto: any): any {
    return {
      nAplicacionesId: dto.nAplicacionesId || dto.id,
      cAplicacionesNombre: dto.cAplicacionesNombre || dto.name,
      cAplicacionesDescripcion: dto.cAplicacionesDescripcion || dto.description,
      cAplicacionesCodigo: dto.cAplicacionesCodigo || dto.code,
      bAplicacionesEsActiva: dto.bAplicacionesEsActiva !== undefined ? dto.bAplicacionesEsActiva : dto.isActive,
      dAplicacionesFechaCreacion: dto.dAplicacionesFechaCreacion || dto.createdAt,
      dAplicacionesFechaModificacion: dto.dAplicacionesFechaModificacion || dto.updatedAt
    };
  }

  adaptToEntity(dto: any): any {
    return this.adaptToExtendedEntity(dto);
  }

  adaptToEntities(dtos: any): any[] {
    const items = Array.isArray(dtos)
      ? dtos
      : (dtos?.lstItem ?? dtos?.LstItem ?? dtos?.listItem ?? dtos?.items ?? dtos?.data ?? []);
    return (items as any[]).map(dto => this.adaptToEntity(dto));
  }

  adaptCreateDto(name: string, description: string, code: string, isActive: boolean): any {
    return {
      cAplicacionesNombre: name,
      cAplicacionesDescripcion: description,
      cAplicacionesCodigo: code,
      bAplicacionesEsActiva: isActive
    };
  }

  adaptUpdateDto(id: number, name?: string, description?: string, code?: string, isActive?: boolean): any {
    const dto: any = { nAplicacionesId: id };
    
    if (name !== undefined) dto.cAplicacionesNombre = name;
    if (description !== undefined) dto.cAplicacionesDescripcion = description;
    if (code !== undefined) dto.cAplicacionesCodigo = code;
    if (isActive !== undefined) dto.bAplicacionesEsActiva = isActive;
    
    return dto;
  }

  adaptCreateResponse(dto: any): { application: Application; tokens?: AppRegistroTokens } {
    // Handle the new response structure that includes AppRegistro tokens
    const application = new Application(
      dto.nAplicacionesId?.toString() || dto.id?.toString() || '',
      dto.cAplicacionesNombre || dto.name || '',
      dto.cAplicacionesDescripcion || dto.description || '',
      dto.cAplicacionesCodigo || dto.code || '',
      dto.bAplicacionesEsActiva !== undefined ? dto.bAplicacionesEsActiva : (dto.isActive || true),
      new Date(dto.dAplicacionesFechaCreacion || dto.createdAt || Date.now()),
      new Date(dto.dAplicacionesFechaActualizacion || dto.updatedAt || Date.now())
    );

    // Extract AppRegistro tokens if present in response
    let tokens: AppRegistroTokens | undefined;
    if (dto.cAppRegistroTokenAcceso || dto.accessToken) {
      tokens = {
        accessToken: dto.cAppRegistroTokenAcceso || dto.accessToken || '',
        secretToken: dto.cAppRegistroSecretoApp || dto.secretToken || '',
        expirationDate: new Date(dto.dAppRegistroFechaExpiracion || dto.expirationDate || Date.now())
      };
    }

    return { application, tokens };
  }
}
