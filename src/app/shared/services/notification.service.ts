import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showSuccess(message: string): void {
    // Success notification logic will be implemented here
    console.log('Success:', message);
  }

  showError(message: string): void {
    // Error notification logic will be implemented here
    console.error('Error:', message);
  }

  showInfo(message: string): void {
    // Info notification logic will be implemented here
    console.info('Info:', message);
  }
}