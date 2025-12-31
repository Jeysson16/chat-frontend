import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../infrastructure/services/application.service';
import { ConfigurationService } from '../../infrastructure/services/configuration.service';
import { IAplicacion } from '../../shared/interfaces';

@Component({
  selector: 'app-company-configurations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './company-configurations.component.html',
  styleUrls: ['./company-configurations.component.scss']
})
export class CompanyConfigurationsComponent implements OnInit {
  empresaId!: number;
  aplicaciones: { id: number; name: string; code: string }[] = [];
  selectedAplicacionId: number | null = null;

  configForm: FormGroup;
  isSaving = false;
  heredadas: any[] = [];
  existingConfig: any | null = null;
  hasConfig = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private appService: ApplicationService,
    private configService: ConfigurationService,
    private snackBar: MatSnackBar
  ) {
    this.configForm = this.fb.group({
      Nombre: ['', [Validators.maxLength(100)]],
      Descripcion: [''],
      Dominio: ['', [Validators.maxLength(100)]],
      ColorPrimario: ['#233559'],
      ColorSecundario: ['#C90000'],
      UrlLogo: [''],
      FuentePersonalizada: ['Roboto, Arial, sans-serif'],
      MaxUsuarios: [100, [Validators.min(1)]],
      MaxCanales: [50, [Validators.min(1)]],
      CuotaAlmacenamientoGB: [10, [Validators.min(1)]],
      TiempoSesionMinutos: [30, [Validators.min(1)]],
      HabilitarCompartirArchivos: [true],
      HabilitarNotificaciones: [true],
      HabilitarIntegraciones: [false],
      HabilitarAnaliticas: [true]
    });
  }

  ngOnInit(): void {
    this.empresaId = Number(this.route.snapshot.paramMap.get('empresaId'));
    const qp = this.route.snapshot.queryParamMap.get('appId');
    this.selectedAplicacionId = qp ? Number(qp) : null;
    this.loadAplicaciones();
  }

  private loadAplicaciones(): void {
    this.appService.getAplicacionesActivas().subscribe({
      next: (apps: IAplicacion[]) => {
        this.aplicaciones = (apps || []).map((a: IAplicacion) => ({ id: a.nAplicacionesId, name: a.cAplicacionesNombre, code: a.cAplicacionesCodigo }));
        if (!this.selectedAplicacionId) {
          this.selectedAplicacionId = this.aplicaciones.length ? this.aplicaciones[0].id : null;
        }
        if (this.selectedAplicacionId) {
          this.router.navigate([], { relativeTo: this.route, queryParams: { appId: this.selectedAplicacionId }, queryParamsHandling: 'merge' });
        }
        if (this.selectedAplicacionId) {
          this.loadCompanyConfig();
          this.loadHeredadas();
        }
      }
    });
  }

  loadHeredadas(): void {
    if (!this.selectedAplicacionId) return;
    this.configService.getConfiguracionesHeredadas(this.empresaId, this.selectedAplicacionId).subscribe({
      next: (res: any[]) => {
        this.heredadas = res || [];
      }
    });
  }

  onAplicacionChange(id: number): void {
    this.selectedAplicacionId = id;
    this.router.navigate([], { relativeTo: this.route, queryParams: { appId: id }, queryParamsHandling: 'merge' });
    this.loadCompanyConfig();
    this.loadHeredadas();
  }

  save(): void {
    if (!this.selectedAplicacionId || this.configForm.invalid) {
      this.markTouched();
      return;
    }
    this.isSaving = true;
    const payload = JSON.stringify(this.configForm.value);
    if (this.hasConfig && this.existingConfig) {
      this.configService.updateConfiguracionEmpresa({
        nConfiguracionEmpresaId: this.existingConfig.nConfiguracionEmpresaId,
        cConfiguracionEmpresaValor: payload,
        cConfiguracionEmpresaTipo: 'JSON',
        cConfiguracionEmpresaDescripcion: 'Configuración general de empresa',
        bConfiguracionEmpresaEsActiva: true
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.showMessage('Configuración actualizada');
          this.loadCompanyConfig();
          this.loadHeredadas();
        },
        error: () => {
          this.isSaving = false;
          this.showMessage('Error al actualizar configuración');
        }
      });
    } else {
      this.configService.createConfiguracionEmpresa({
        nAplicacionesId: this.selectedAplicacionId,
        nEmpresasId: this.empresaId,
        cConfiguracionEmpresaClave: 'CONFIG_EMPRESA_GENERAL',
        cConfiguracionEmpresaValor: payload,
        cConfiguracionEmpresaTipo: 'JSON',
        cConfiguracionEmpresaDescripcion: 'Configuración general de empresa',
        bConfiguracionEmpresaEsActiva: true
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.showMessage('Configuración creada');
          this.loadCompanyConfig();
          this.loadHeredadas();
        },
        error: () => {
          this.isSaving = false;
          this.showMessage('Error al crear configuración');
        }
      });
    }
  }

  private markTouched(): void {
    Object.keys(this.configForm.controls).forEach(key => this.configForm.get(key)?.markAsTouched());
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
  }

  private loadCompanyConfig(): void {
    if (!this.selectedAplicacionId) return;
    this.configService.getConfiguracionesByEmpresaYAplicacion(this.empresaId, this.selectedAplicacionId).subscribe({
      next: (items: any[]) => {
        const general = (items || []).find(i => i.cConfiguracionEmpresaClave === 'CONFIG_EMPRESA_GENERAL') || null;
        this.existingConfig = general;
        this.hasConfig = !!general;
        if (general && general.cConfiguracionEmpresaValor) {
          try {
            const parsed = JSON.parse(general.cConfiguracionEmpresaValor);
            this.configForm.patchValue(parsed);
          } catch {}
        } else {
          this.configForm.reset({
            Nombre: '', Descripcion: '', Dominio: '', ColorPrimario: '#233559', ColorSecundario: '#C90000', UrlLogo: '',
            FuentePersonalizada: 'Roboto, Arial, sans-serif', MaxUsuarios: 100, MaxCanales: 50, CuotaAlmacenamientoGB: 10,
            TiempoSesionMinutos: 30, HabilitarCompartirArchivos: true, HabilitarNotificaciones: true, HabilitarIntegraciones: false,
            HabilitarAnaliticas: true
          });
        }
      }
    });
  }
}
