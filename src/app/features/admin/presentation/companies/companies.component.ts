import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Company, CompanyCreate, CompanyUpdate } from '../../domain/models/company.model';
import { ApplicationService } from '../../infrastructure/services/application.service';
import { CompanyService } from '../../infrastructure/services/company.service';
import { IAplicacion } from '../../shared/interfaces';
import { CompanyCreateDialogComponent } from './company-create-dialog.component';
import { CompanyConfigDialogComponent } from './company-config-dialog.component';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatMenuModule
  ],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class EmpresasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id','name','code','email','acciones'];

  dataSource = new MatTableDataSource<Company>();
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  empresaForm: FormGroup;
  searchForm: FormGroup;
  isEditMode = false;
  selectedEmpresa: Company | null = null;
  dialogOpen = false;

  searchTerm = '';
  statusFilter: boolean | null = null;
  aplicaciones: IAplicacion[] = [];
  selectedAplicacionId: number | null = null;

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private applicationService: ApplicationService
  ) {
    this.empresaForm = this.createEmpresaForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadAplicaciones();
    this.setupSearchSubscription();
  }

  onAplicacionChange(appId: number | null): void {
    this.selectedAplicacionId = appId ?? null;
    this.currentPage = 0;
    if (this.paginator) this.paginator.firstPage();
    this.dataSource.data = [];
    this.totalRecords = 0;
    this.loadEmpresas();
  }

  private createEmpresaForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.maxLength(20)], [this.codigoDisponibleValidator()]],
      name: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(200)]],
      isActive: [true]
    });
  }

  private codigoDisponibleValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return of(null);
      const excludeId = this.isEditMode && this.selectedEmpresa ? Number(this.selectedEmpresa.id) : undefined;
      return this.companyService.verificarCodigoDisponible(value, excludeId).pipe(
        map(res => (res.disponible ? null : { codigoNoDisponible: true })),
        catchError(() => of(null))
      );
    };
  }

  private emailDisponibleValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) return of(null);
      const excludeId = this.isEditMode && this.selectedEmpresa ? Number(this.selectedEmpresa.id) : undefined;
      return this.companyService.verificarEmailDisponible(value, excludeId).pipe(
        map(res => (res.disponible ? null : { emailNoDisponible: true })),
        catchError(() => of(null))
      );
    };
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      statusFilter: [null]
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('searchTerm')?.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      this.searchTerm = value;
      this.currentPage = 0;
      this.loadEmpresas();
    });
    this.searchForm.get('statusFilter')?.valueChanges.subscribe(value => {
      this.statusFilter = value;
      this.currentPage = 0;
      this.loadEmpresas();
    });
  }

  private loadAplicaciones(): void {
    this.applicationService.getAplicacionesActivas().subscribe({
      next: (apps: any) => {
        const arr = Array.isArray(apps) ? apps : (apps?.lstItem ?? apps?.LstItem ?? []);
        this.aplicaciones = arr;
        this.loadEmpresas();
      },
      error: () => this.loadEmpresas()
    });
  }

  loadEmpresas(): void {
    this.isLoading = true;
    // reset vista antes de cargar
    this.dataSource.data = [];
    this.totalRecords = 0;
    if (this.selectedAplicacionId) {
      this.companyService.getEmpresasByAplicacion(this.selectedAplicacionId).subscribe({
        next: (list) => {
          const data = (list || []).map(s => ({
            id: String(s.nEmpresasId),
            name: s.cEmpresasNombre,
            code: s.cEmpresasCodigo,
            description: '',
            contact: { email: '', phone: '' },
            address: { street: '' },
            isActive: (s as any).bEmpresasEsActiva ?? (s as any).bEmpresasActiva ?? true
          } as Company));
          this.dataSource.data = data;
          this.totalRecords = data.length;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; this.dataSource.data = []; this.totalRecords = 0; }
      });
    } else {
      this.companyService.getEmpresas(this.currentPage + 1, this.pageSize, this.searchTerm || undefined).subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalRecords = response.total;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; this.dataSource.data = []; this.totalRecords = 0; }
      });
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmpresas();
  }

  openCreateDialog(): void {
    if (!this.selectedAplicacionId) {
      this.showMessage('Seleccione una aplicación antes de crear una empresa');
      return;
    }
    const selectedApp = (this.aplicaciones || []).find(a => a.nAplicacionesId === this.selectedAplicacionId);
    const appLabel = selectedApp ? `${selectedApp.cAplicacionesNombre} (${selectedApp.cAplicacionesCodigo})` : 'Aplicación';
    const dialogRef = this.dialog.open(CompanyCreateDialogComponent, {
      width: '480px',
      data: { aplicacionId: this.selectedAplicacionId, aplicacionLabel: appLabel }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createEmpresa(result);
      }
    });
  }

  openEditDialog(empresa: Company): void {
    this.isEditMode = true;
    this.selectedEmpresa = empresa;
    this.empresaForm.patchValue({
      code: empresa.code,
      name: empresa.name,
      email: empresa.contact?.email,
      phone: empresa.contact?.phone,
      address: empresa.address?.street,
      isActive: empresa.isActive
    });
    this.dialogOpen = true;
  }

  saveEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.markFormGroupTouched(this.empresaForm);
      return;
    }
    const formData = this.empresaForm.value;
    if (this.isEditMode && this.selectedEmpresa) {
      this.updateEmpresa(Number(this.selectedEmpresa.id), formData);
    } else {
      this.createEmpresa(formData);
    }
  }

  private createEmpresa(data: any): void {
    const model: CompanyCreate = {
      name: data.name,
      code: data.code,
      description: undefined,
      contact: { email: data.email, phone: data.phone },
      aplicacionId: this.selectedAplicacionId ?? undefined
    };
    this.companyService.createEmpresa(model).subscribe({
      next: () => {
        this.showMessage('Empresa creada exitosamente');
        this.loadEmpresas();
        this.closeDialog();
        // Navegar a configuración de empresa inmediatamente
        const nueva = this.dataSource.data.find(e => e.code === data.code);
        if (nueva) {
          this.goToCompanyConfig(nueva);
        }
      },
      error: () => { this.showMessage('Error al crear la empresa'); }
    });
  }

  private updateEmpresa(id: number, data: any): void {
    const model: CompanyUpdate = { id: String(id), code: data.code, name: data.name, description: undefined, contact: { email: data.email, phone: data.phone }, isActive: data.isActive };
    this.companyService.updateEmpresa(model).subscribe({
      next: () => { this.showMessage('Empresa actualizada exitosamente'); this.loadEmpresas(); this.closeDialog(); },
      error: () => { this.showMessage('Error al actualizar la empresa'); }
    });
  }

  deleteEmpresa(empresa: Company): void {
    if (confirm(`¿Está seguro de eliminar la empresa "${empresa.name}"?`)) {
      this.companyService.deleteEmpresa(Number(empresa.id)).subscribe({
        next: () => { this.showMessage('Empresa eliminada exitosamente'); this.loadEmpresas(); },
        error: () => { this.showMessage('Error al eliminar la empresa'); }
      });
    }
  }

  goToCompanyConfig(empresa: Company): void {
    if (!this.selectedAplicacionId) { this.showMessage('Seleccione una aplicación'); return; }
    this.dialog.open(CompanyConfigDialogComponent, {
      width: '720px',
      data: { empresaId: Number(empresa.id), aplicacionId: this.selectedAplicacionId }
    }).afterClosed().subscribe(ok => { if (ok) { this.showMessage('Configuración actualizada'); } });
  }

  toggleStatus(empresa: Company): void {
    this.companyService.toggleEmpresaStatus(Number(empresa.id), !empresa.isActive).subscribe({
      next: () => { const status = empresa.isActive ? 'desactivada' : 'activada'; this.showMessage(`Empresa ${status} exitosamente`); this.loadEmpresas(); },
      error: () => { this.showMessage('Error al cambiar el estado de la empresa'); }
    });
  }

  closeDialog(): void {
    this.isEditMode = false;
    this.selectedEmpresa = null;
    this.empresaForm.reset();
    this.dialogOpen = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => formGroup.get(key)?.markAsTouched());
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchTerm = '';
    this.statusFilter = null;
    this.selectedAplicacionId = null;
    this.currentPage = 0;
    this.loadEmpresas();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.empresaForm.get(fieldName);
    if (!control) return '';
    if (control.hasError('required')) return `${fieldName} es requerido`;
    if (control.hasError('email')) return 'Email inválido';
    if (control.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    if (control.hasError('codigoNoDisponible')) return 'Código no disponible';
    if (control.hasError('emailNoDisponible')) return 'Email no disponible';
    return '';
  }
}
