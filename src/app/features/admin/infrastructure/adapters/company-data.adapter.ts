import { IEmpresa } from '../../domain/entities/company.interfaces';
import { Company, CompanyContact, CompanyCreate, CompanyUpdate } from '../../domain/models/company.model';

export class CompanyDataAdapter {
  toModel(entity: IEmpresa): Company {
    const contact: CompanyContact = {
      email: entity.cEmpresasEmail || ''
    };
    return {
      id: String(entity.nEmpresasId),
      name: entity.cEmpresasNombre,
      code: entity.cEmpresasCodigo,
      description: entity.cEmpresasDescripcion,
      contact,
      isActive: !!entity.bEmpresasEsActiva,
      createdAt: entity.dEmpresasFechaCreacion ? new Date(entity.dEmpresasFechaCreacion) : new Date(),
      updatedAt: entity.dEmpresasFechaActualizacion ? new Date(entity.dEmpresasFechaActualizacion) : new Date()
    } as Company;
  }

  toEntity(model: Company): IEmpresa {
    return {
      nEmpresasId: Number(model.id),
      cEmpresasNombre: model.name,
      cEmpresasCodigo: model.code,
      cEmpresasDescripcion: model.description,
      cEmpresasEmail: model.contact?.email,
      bEmpresasEsActiva: model.isActive
    } as IEmpresa;
  }

  buildCreateRequest(model: CompanyCreate): any {
    return {
      cEmpresasNombre: model.name,
      cEmpresasCodigo: model.code,
      cEmpresasDescripcion: model.description,
      cEmpresasEmail: model.contact?.email,
      cEmpresasTelefono: model.contact?.phone,
      bEmpresasEsActiva: true,
      nEmpresasAplicacionId: model.aplicacionId ?? 0
    };
  }

  buildUpdateRequest(model: CompanyUpdate): any {
    return {
      nEmpresasId: Number(model.id),
      cEmpresasNombre: model.name,
      cEmpresasDescripcion: model.description,
      cEmpresasCodigo: model.code,
      cEmpresasEmail: model.contact?.email,
      cEmpresasTelefono: model.contact?.phone,
      bEmpresasEsActiva: model.isActive
    };
  }

  normalizeListResponse(res: any): IEmpresa[] {
    if (Array.isArray(res)) return res as IEmpresa[];
    const list = res?.data ?? res?.lstItem ?? res?.items ?? [];
    return Array.isArray(list) ? list : [];
  }
}
