import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  showSuccess(message: string): void { console.log('Success:', message); }
  showError(message: string): void { console.error('Error:', message); }
  showInfo(message: string): void { console.info('Info:', message); }
}
