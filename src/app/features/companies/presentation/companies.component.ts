import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';

import { IEmpresa, ICreateEmpresaDto, IUpdateEmpresaDto, IEmpresaResponse } from '../shared/interfaces';
import { CompanyService } from '../infrastructure/services/company.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [
    CommonModule,
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

  displayedColumns: string[] = [
    'nEmpresasId',
    'cEmpresasNombre',
    'cEmpresasCodigo',
    'cEmpresasEmail',
    'bEmpresasEsActiva',
    'acciones'
  ];

  dataSource = new MatTableDataSource<IEmpresa>();
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  // Formularios
  empresaForm: FormGroup;
  searchForm: FormGroup;
  isEditMode = false;
  selectedEmpresa: IEmpresa | null = null;

  // Filtros
  searchTerm = '';
  statusFilter: boolean | null = null;

  // Helper method for template
  getTotalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.empresaForm = this.createEmpresaForm();
    this.searchForm = this.createSearchForm();
  }

  ngOnInit(): void {
    this.loadEmpresas();
    this.setupSearchSubscription();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private createEmpresaForm(): FormGroup {
    return this.fb.group({
      cEmpresasCodigo: ['', [Validators.required, Validators.maxLength(20)]],
      cEmpresasNombre: ['', [Validators.required, Validators.maxLength(100)]],
      cEmpresasEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      cEmpresasTelefono: ['', [Validators.maxLength(20)]],
      cEmpresasDireccion: ['', [Validators.maxLength(200)]],
      bEmpresasEsActiva: [true]
    });
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      statusFilter: [null]
    });
  }

  private setupSearchSubscription(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.searchTerm = value;
        this.currentPage = 0;
        this.loadEmpresas();
      });

    this.searchForm.get('statusFilter')?.valueChanges
      .subscribe(value => {
        this.statusFilter = value;
        this.currentPage = 0;
        this.loadEmpresas();
      });
  }

  loadEmpresas(): void {
    this.isLoading = true;
    
    this.companyService.getEmpresas(
      this.currentPage + 1,
      this.pageSize,
      this.searchTerm || undefined
    ).subscribe({
      next: (response: IEmpresaResponse) => {
        this.dataSource.data = response.data;
        this.totalRecords = response.total;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar empresas:', error);
        this.showMessage('Error al cargar las empresas');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmpresas();
  }

  openCreateDialog(): void {
    this.isEditMode = false;
    this.selectedEmpresa = null;
    this.empresaForm.reset();
    this.empresaForm.patchValue({ bEmpresasEsActiva: true });
  }

  openEditDialog(empresa: IEmpresa): void {
    this.isEditMode = true;
    this.selectedEmpresa = empresa;
    this.empresaForm.patchValue(empresa);
  }

  saveEmpresa(): void {
    if (this.empresaForm.invalid) {
      this.markFormGroupTouched(this.empresaForm);
      return;
    }

    const formData = this.empresaForm.value;

    if (this.isEditMode && this.selectedEmpresa) {
      this.updateEmpresa(this.selectedEmpresa.nEmpresasId, formData);
    } else {
      this.createEmpresa(formData);
    }
  }

  private createEmpresa(data: ICreateEmpresaDto): void {
    this.companyService.createEmpresa(data).subscribe({
      next: () => {
        this.showMessage('Empresa creada exitosamente');
        this.loadEmpresas();
        this.closeDialog();
      },
      error: (error: any) => {
        console.error('Error al crear empresa:', error);
        this.showMessage('Error al crear la empresa');
      }
    });
  }

  private updateEmpresa(id: number, data: IUpdateEmpresaDto): void {
    this.companyService.updateEmpresa(data).subscribe({
      next: () => {
        this.showMessage('Empresa actualizada exitosamente');
        this.loadEmpresas();
        this.closeDialog();
      },
      error: (error: any) => {
        console.error('Error al actualizar empresa:', error);
        this.showMessage('Error al actualizar la empresa');
      }
    });
  }

  deleteEmpresa(empresa: IEmpresa): void {
    if (confirm(`¿Está seguro de eliminar la empresa "${empresa.cEmpresasNombre}"?`)) {
      this.companyService.deleteEmpresa(empresa.nEmpresasId).subscribe({
        next: () => {
          this.showMessage('Empresa eliminada exitosamente');
          this.loadEmpresas();
        },
        error: (error: any) => {
          console.error('Error al eliminar empresa:', error);
          this.showMessage('Error al eliminar la empresa');
        }
      });
    }
  }

  toggleStatus(empresa: IEmpresa): void {
    this.companyService.toggleEmpresaStatus(empresa.nEmpresasId, !empresa.bEmpresasEsActiva).subscribe({
      next: () => {
        const status = empresa.bEmpresasEsActiva ? 'desactivada' : 'activada';
        this.showMessage(`Empresa ${status} exitosamente`);
        this.loadEmpresas();
      },
      error: (error: any) => {
        console.error('Error al cambiar estado:', error);
        this.showMessage('Error al cambiar el estado de la empresa');
      }
    });
  }

  closeDialog(): void {
    this.isEditMode = false;
    this.selectedEmpresa = null;
    this.empresaForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.empresaForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchTerm = '';
    this.statusFilter = null;
    this.currentPage = 0;
    this.loadEmpresas();
  }
}