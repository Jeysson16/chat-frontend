import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfigurationService } from '../../infrastructure/services/configuration.service';
import { IConfiguracionEmpresa, ICreateConfiguracionEmpresaDto, IUpdateConfiguracionEmpresaDto } from '../../shared/application-configuration.interfaces';

@Component({
  selector: 'app-company-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Configuración de Aplicación</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" mat-dialog-content class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <mat-slide-toggle color="primary" formControlName="bPermitirAdjuntos">Permitir adjuntos</mat-slide-toggle>
        <mat-slide-toggle color="primary" formControlName="bPermitirVisualizacionAdjuntos">Permitir visualización adjuntos</mat-slide-toggle>
        <mat-slide-toggle color="primary" formControlName="bPermitirNotificaciones">Permitir notificaciones</mat-slide-toggle>
      </div>

      <mat-divider></mat-divider>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Configuración de Chat</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Longitud máxima de mensaje*</mat-label>
            <input matInput type="number" formControlName="nMaxLongitudMensaje" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Tiempo de sesión (minutos)*</mat-label>
            <input matInput type="number" formControlName="nTiempoExpiracionSesion" />
          </mat-form-field>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <mat-slide-toggle color="primary" formControlName="bPermitirEmojis">Permitir emojis</mat-slide-toggle>
          <mat-slide-toggle color="primary" formControlName="bRequiereAutenticacion">Requiere autenticación</mat-slide-toggle>
          <mat-slide-toggle color="primary" formControlName="bPermitirMensajesAnonimos">Permitir mensajes anónimos</mat-slide-toggle>
        </div>
      </div>

      <mat-divider></mat-divider>
    </form>
    <div mat-dialog-actions class="flex justify-end gap-3">
      <button mat-stroked-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="submit()">Actualizar</button>
    </div>
  `
})
export class CompanyConfigDialogComponent implements OnInit {
  form: FormGroup;
  existing: Record<string, IConfiguracionEmpresa> = {};

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { empresaId: number; aplicacionId: number },
    private configService: ConfigurationService
  ) {
    this.form = this.fb.group({
      bPermitirAdjuntos: [false],
      bPermitirVisualizacionAdjuntos: [false],
      bPermitirNotificaciones: [true],
      nMaxLongitudMensaje: [1000, [Validators.required, Validators.min(1)]],
      nTiempoExpiracionSesion: [3600, [Validators.required, Validators.min(1)]],
      bPermitirEmojis: [true],
      bRequiereAutenticacion: [true],
      bPermitirMensajesAnonimos: [false]
    });
  }

  ngOnInit(): void {
    this.configService.getConfiguracionesByEmpresaYAplicacion(this.data.empresaId, this.data.aplicacionId).subscribe(cfgs => {
      (cfgs || []).forEach(c => {
        this.existing[c.cConfiguracionEmpresaClave] = c;
        const v = c.cConfiguracionEmpresaValor;
        switch (c.cConfiguracionEmpresaClave) {
          case 'bPermitirAdjuntos': this.form.patchValue({ bPermitirAdjuntos: this.toBool(v) }); break;
          case 'bPermitirVisualizacionAdjuntos': this.form.patchValue({ bPermitirVisualizacionAdjuntos: this.toBool(v) }); break;
          case 'bPermitirNotificaciones': this.form.patchValue({ bPermitirNotificaciones: this.toBool(v) }); break;
          case 'nMaxLongitudMensaje': this.form.patchValue({ nMaxLongitudMensaje: this.toNum(v) }); break;
          case 'nTiempoExpiracionSesion': this.form.patchValue({ nTiempoExpiracionSesion: this.toNum(v) }); break;
          case 'bPermitirEmojis': this.form.patchValue({ bPermitirEmojis: this.toBool(v) }); break;
          case 'bRequiereAutenticacion': this.form.patchValue({ bRequiereAutenticacion: this.toBool(v) }); break;
          case 'bPermitirMensajesAnonimos': this.form.patchValue({ bPermitirMensajesAnonimos: this.toBool(v) }); break;
        }
      });
    });
  }

  private toBool(v: any): boolean { return String(v).toLowerCase() === 'true'; }
  private toNum(v: any): number { const n = Number(v); return isNaN(n) ? 0 : n; }

  submit(): void {
    if (this.form.invalid) return;
    const empresaId = this.data.empresaId;
    const aplicacionId = this.data.aplicacionId;
    const bodyList: (ICreateConfiguracionEmpresaDto | IUpdateConfiguracionEmpresaDto)[] = [];

    const addUpsert = (clave: string, valor: string, tipo: string = 'text') => {
      const existing = this.existing[clave];
      if (existing && existing.nConfiguracionEmpresaId && existing.nConfiguracionEmpresaId > 0) {
        bodyList.push({ nConfiguracionEmpresaId: existing.nConfiguracionEmpresaId, cConfiguracionEmpresaValor: valor, cConfiguracionEmpresaTipo: tipo } as IUpdateConfiguracionEmpresaDto);
      } else {
        bodyList.push({ nEmpresasId: empresaId, nAplicacionesId: aplicacionId, cConfiguracionEmpresaClave: clave, cConfiguracionEmpresaValor: valor, cConfiguracionEmpresaTipo: tipo, bConfiguracionEmpresaEsActiva: true } as ICreateConfiguracionEmpresaDto);
      }
    };

    const f = this.form.value;
    addUpsert('bPermitirAdjuntos', String(!!f.bPermitirAdjuntos), 'boolean');
    addUpsert('bPermitirVisualizacionAdjuntos', String(!!f.bPermitirVisualizacionAdjuntos), 'boolean');
    addUpsert('bPermitirNotificaciones', String(!!f.bPermitirNotificaciones), 'boolean');
    addUpsert('nMaxLongitudMensaje', String(Number(f.nMaxLongitudMensaje)), 'number');
    addUpsert('nTiempoExpiracionSesion', String(Number(f.nTiempoExpiracionSesion)), 'number');
    addUpsert('bPermitirEmojis', String(!!f.bPermitirEmojis), 'boolean');
    addUpsert('bRequiereAutenticacion', String(!!f.bRequiereAutenticacion), 'boolean');
    addUpsert('bPermitirMensajesAnonimos', String(!!f.bPermitirMensajesAnonimos), 'boolean');

    const ops = bodyList.map(b => ('nConfiguracionEmpresaId' in b)
      ? this.configService.updateConfiguracionEmpresa(b as IUpdateConfiguracionEmpresaDto)
      : this.configService.createConfiguracionEmpresa(b as ICreateConfiguracionEmpresaDto)
    );

    if (ops.length === 0) { this.close(); return; }
    // Ejecutar secuencialmente para evitar colisiones
    const run = (i: number) => {
      if (i >= ops.length) { this.dialogRef.close(true); return; }
      ops[i].subscribe({ next: () => run(i + 1), error: () => run(i + 1) });
    };
    run(0);
  }

  close(): void { this.dialogRef.close(); }
}

