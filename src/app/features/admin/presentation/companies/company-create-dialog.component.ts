import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-company-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Nueva Empresa</h2>
    <form [formGroup]="form" (ngSubmit)="submit()" mat-dialog-content class="space-y-4 mt-2">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Código*</mat-label>
        <input matInput formControlName="code" placeholder="Código único" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Aplicación*</mat-label>
        <mat-select formControlName="aplicacionId">
          <mat-option [value]="data.aplicacionId">{{ data.aplicacionLabel }}</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" />
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="phone" />
      </mat-form-field>

      <mat-checkbox formControlName="isActive" color="primary">Empresa activa</mat-checkbox>
    </form>
    <div mat-dialog-actions class="flex justify-end gap-3">
      <button mat-stroked-button (click)="close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="submit()">Crear</button>
    </div>
  `
})
export class CompanyCreateDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompanyCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { aplicacionId: number; aplicacionLabel?: string }
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)]],
      aplicacionId: [data.aplicacionId, [Validators.required]],
      name: [''],
      email: [''],
      phone: [''],
      isActive: [true]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
