import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthResult } from '../../domain/entities/auth-result.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    // Ensure clean storage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should perform login and store token/user', (done) => {
    const backendResponse = {
      data: {
        success: true,
        token: 'test-token',
        user: {
          cPerCodigo: 'jdoe',
          cUsuarioEmail: 'john@example.com',
          cUsuarioNombre: 'John Doe',
        },
        message: 'ok',
      },
    };

    let result: AuthResult | undefined;

    service.login('jdoe', 'password', true).subscribe({
      next: (res) => {
        result = res;
        // token stored
        expect(localStorage.getItem('auth_token')).toBe('test-token');
        // user stored
        const storedUser = localStorage.getItem('user');
        expect(storedUser).toBeTruthy();
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;
        expect(parsedUser?.name).toBe('John Doe');
        // current user updated
        expect(service.getCurrentUserValue()?.name).toBe('John Doe');
        // result shape
        expect(result?.success).toBeTrue();
        done();
      },
      error: (err) => {
        fail('Login should not error: ' + err);
        done();
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/v1/auth/login'));
    expect(req.request.method).toBe('POST');
    req.flush(backendResponse);
  });

  it('should logout and clear storage and current user', (done) => {
    localStorage.setItem('auth_token', 'x');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test' }));

    service.logout().subscribe({
      next: () => {
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(localStorage.getItem('application')).toBeNull();
        expect(service.getCurrentUserValue()).toBeNull();
        done();
      },
      error: (err) => {
        fail('Logout should not error: ' + err);
        done();
      },
    });

    const req = httpMock.expectOne((r) => r.method === 'POST' && r.url.includes('/v1/auth/logout'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});