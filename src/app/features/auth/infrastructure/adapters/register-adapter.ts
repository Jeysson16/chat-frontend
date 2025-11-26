export interface FrontendRegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string; // opcional, si no viene se deriva
  perJurCodigo?: string; // opcional, DEFAULT si no viene
  perCodigo?: string; // opcional, si no viene lo asigna backend
}

export interface BackendRegisterPayload {
  cUsuariosNombre: string;
  cUsuariosEmail: string;
  cUsuariosCodigo: string;
  cUsuariosPassword: string;
  cUsuariosConfirmarPassword: string;
  cUsuariosPerJurCodigo: string;
  cUsuariosPerCodigo?: string;
}

/**
 * Adapter para transformar los datos del formulario de registro del frontend
 * al formato requerido por el backend con prefijos de tipo (c/d/n).
 */
export class RegisterAdapter {
  static toBackendPayload(input: FrontendRegisterInput): BackendRegisterPayload {
    const nombre = input.name?.trim() || this.deriveNombre(input.username, input.email);
    const confirmar = input.confirmPassword ?? input.password;

    return {
      cUsuariosNombre: nombre,
      cUsuariosEmail: input.email,
      cUsuariosCodigo: input.username || input.email,
      cUsuariosPassword: input.password,
      cUsuariosConfirmarPassword: confirmar,
      cUsuariosPerJurCodigo: input.perJurCodigo?.trim() || 'DEFAULT',
      cUsuariosPerCodigo: input.perCodigo?.trim()
    };
  }

  /**
   * Deriva un nombre amigable a partir del usuario/email si no se provee explícito.
   */
  private static deriveNombre(usuario: string, email: string): string {
    const base = usuario?.trim() || email?.split('@')[0] || 'User';
    // Capitalizar simple
    return base.charAt(0).toUpperCase() + base.slice(1);
  }
}
