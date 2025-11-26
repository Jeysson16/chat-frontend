import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface TokenData {
  cCodigoAplicacion: string;
  cTokenAcceso: string;
  cTokenSecreto: string;
  dFechaExpiracion: Date;
  bEsActivo: boolean;
}

@Component({
  selector: 'app-token-display',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="token-display-container">
      <!-- Header -->
      <div class="token-header">
        <div class="flex items-center space-x-3">
          <div class="token-icon">
            <mat-icon class="text-blue-600">vpn_key</mat-icon>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Tokens de Aplicación</h3>
            <p class="text-sm text-gray-600">{{ tokenData.cCodigoAplicacion }}</p>
          </div>
        </div>
        <div class="status-badge" [class]="getStatusClass()">
          <mat-icon class="status-icon">{{ getStatusIcon() }}</mat-icon>
          <span>{{ getStatusText() }}</span>
        </div>
      </div>

      <!-- Token Cards -->
      <div class="token-cards-grid">
        <!-- Access Token -->
        <div class="token-card access-token">
          <div class="token-card-header">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-green-600">security</mat-icon>
              <h4 class="font-medium text-gray-900">Token de Acceso</h4>
            </div>
            <button 
              mat-icon-button 
              (click)="copyToClipboard(tokenData.cTokenAcceso, 'Token de acceso')"
              matTooltip="Copiar token de acceso"
              class="copy-button"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <div class="token-value-container">
            <div class="token-value" [class.blurred]="!showAccessToken">
              {{ tokenData.cTokenAcceso }}
            </div>
            <button 
              mat-icon-button 
              (click)="toggleAccessTokenVisibility()"
              [matTooltip]="showAccessToken ? 'Ocultar token' : 'Mostrar token'"
              class="visibility-button"
            >
              <mat-icon>{{ showAccessToken ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </div>
        </div>

        <!-- Secret Token -->
        <div class="token-card secret-token">
          <div class="token-card-header">
            <div class="flex items-center space-x-2">
              <mat-icon class="text-red-600">lock</mat-icon>
              <h4 class="font-medium text-gray-900">Token Secreto</h4>
            </div>
            <button 
              mat-icon-button 
              (click)="copyToClipboard(tokenData.cTokenSecreto, 'Token secreto')"
              matTooltip="Copiar token secreto"
              class="copy-button"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <div class="token-value-container">
            <div class="token-value" [class.blurred]="!showSecretToken">
              {{ tokenData.cTokenSecreto }}
            </div>
            <button 
              mat-icon-button 
              (click)="toggleSecretTokenVisibility()"
              [matTooltip]="showSecretToken ? 'Ocultar token' : 'Mostrar token'"
              class="visibility-button"
            >
              <mat-icon>{{ showSecretToken ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Token Info -->
      <div class="token-info">
        <div class="info-grid">
          <div class="info-item">
            <mat-icon class="text-blue-500">schedule</mat-icon>
            <div>
              <span class="info-label">Fecha de Expiración</span>
              <span class="info-value">{{ formatDate(tokenData.dFechaExpiracion) }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon class="text-purple-500">timer</mat-icon>
            <div>
              <span class="info-label">Tiempo Restante</span>
              <span class="info-value" [class]="getTimeRemainingClass()">{{ getTimeRemaining() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Warning -->
      <div class="security-warning">
        <mat-icon class="text-amber-600">warning</mat-icon>
        <div class="warning-content">
          <h5 class="font-medium text-amber-800">Importante - Seguridad de Tokens</h5>
          <p class="text-sm text-amber-700">
            Mantén estos tokens seguros. No los compartas públicamente ni los incluyas en código fuente.
            Úsalos únicamente en entornos seguros del servidor.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .token-display-container {
      @apply bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
    }

    .token-header {
      @apply flex items-center justify-between pb-4 border-b border-gray-200;
    }

    .token-icon {
      @apply w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center;
    }

    .status-badge {
      @apply flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium;
    }

    .status-badge.active {
      @apply bg-green-100 text-green-800;
    }

    .status-badge.inactive {
      @apply bg-red-100 text-red-800;
    }

    .status-badge.expired {
      @apply bg-gray-100 text-gray-800;
    }

    .status-icon {
      @apply w-4 h-4;
    }

    .token-cards-grid {
      @apply grid grid-cols-1 lg:grid-cols-2 gap-4;
    }

    .token-card {
      @apply bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4 space-y-3;
      transition: all 0.3s ease;
    }

    .token-card:hover {
      @apply shadow-md border-gray-300;
      transform: translateY(-2px);
    }

    .access-token {
      @apply border-l-4 border-l-green-500;
    }

    .secret-token {
      @apply border-l-4 border-l-red-500;
    }

    .token-card-header {
      @apply flex items-center justify-between;
    }

    .token-value-container {
      @apply relative flex items-center space-x-2;
    }

    .token-value {
      @apply flex-1 font-mono text-sm bg-gray-100 p-3 rounded border;
      word-break: break-all;
      transition: filter 0.3s ease;
    }

    .token-value.blurred {
      filter: blur(4px);
    }

    .copy-button, .visibility-button {
      @apply text-gray-500 hover:text-blue-600;
      transition: color 0.2s ease;
    }

    .copy-button:hover, .visibility-button:hover {
      @apply bg-blue-50;
    }

    .token-info {
      @apply bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4;
    }

    .info-grid {
      @apply grid grid-cols-1 md:grid-cols-2 gap-4;
    }

    .info-item {
      @apply flex items-center space-x-3;
    }

    .info-label {
      @apply block text-sm font-medium text-gray-600;
    }

    .info-value {
      @apply block text-sm text-gray-900;
    }

    .info-value.warning {
      @apply text-amber-600 font-medium;
    }

    .info-value.danger {
      @apply text-red-600 font-medium;
    }

    .security-warning {
      @apply flex items-start space-x-3 bg-amber-50 border border-amber-200 rounded-lg p-4;
    }

    .warning-content h5 {
      @apply mb-1;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .token-display-container {
      animation: fadeIn 0.5s ease-out;
    }

    .token-card {
      animation: fadeIn 0.6s ease-out;
    }

    .token-card:nth-child(2) {
      animation-delay: 0.1s;
    }
  `]
})
export class TokenDisplayComponent implements OnInit {
  @Input() tokenData!: TokenData;
  
  showAccessToken = false;
  showSecretToken = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if (!this.tokenData) {
      console.error('TokenDisplayComponent: tokenData is required');
    }
  }

  toggleAccessTokenVisibility(): void {
    this.showAccessToken = !this.showAccessToken;
  }

  toggleSecretTokenVisibility(): void {
    this.showSecretToken = !this.showSecretToken;
  }

  async copyToClipboard(text: string, tokenType: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.snackBar.open(`${tokenType} copiado al portapapeles`, 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
      this.snackBar.open('Error al copiar al portapapeles', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  getStatusClass(): string {
    if (!this.tokenData.bEsActivo) return 'inactive';
    if (this.isExpired()) return 'expired';
    return 'active';
  }

  getStatusIcon(): string {
    if (!this.tokenData.bEsActivo) return 'block';
    if (this.isExpired()) return 'schedule';
    return 'check_circle';
  }

  getStatusText(): string {
    if (!this.tokenData.bEsActivo) return 'Inactivo';
    if (this.isExpired()) return 'Expirado';
    return 'Activo';
  }

  isExpired(): boolean {
    return new Date() > new Date(this.tokenData.dFechaExpiracion);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeRemaining(): string {
    const now = new Date();
    const expiration = new Date(this.tokenData.dFechaExpiracion);
    const diff = expiration.getTime() - now.getTime();

    if (diff <= 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} días`;
    if (hours > 0) return `${hours} horas`;
    return 'Menos de 1 hora';
  }

  getTimeRemainingClass(): string {
    const now = new Date();
    const expiration = new Date(this.tokenData.dFechaExpiracion);
    const diff = expiration.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff <= 0) return 'danger';
    if (days <= 7) return 'warning';
    return '';
  }
}