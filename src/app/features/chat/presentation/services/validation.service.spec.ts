import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => { service = new ValidationService(); });

  it('permite cuando no hay restricciones', () => {
    const file = new File([new Blob(['x'])], 'a.txt', { type: 'text/plain' });
    expect(service.isTypeAllowed(file, undefined)).toBeTrue();
    expect(service.isSizeAllowed(file, undefined)).toBeTrue();
  });

  it('bloquea tipo no permitido por extension', () => {
    const file = new File([new Blob(['x'])], 'a.exe', { type: 'application/octet-stream' });
    expect(service.isTypeAllowed(file, ['jpg','png'])).toBeFalse();
  });

  it('permite tipo por mimetype', () => {
    const file = new File([new Blob(['x'])], 'a.custom', { type: 'image/png' });
    expect(service.isTypeAllowed(file, ['image'])).toBeTrue();
  });

  it('bloquea tamaño mayor al máximo', () => {
    const big = new File([new Blob([new Uint8Array(10)])], 'big.bin', { type: 'application/octet-stream' });
    expect(service.isSizeAllowed(big, 5)).toBeFalse();
  });
});
