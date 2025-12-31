import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  isTypeAllowed(file: File, allowed: string[] | undefined): boolean {
    if (!allowed || allowed.length === 0) return true;
    const mime = (file.type || '').toLowerCase();
    const ext = this.getExtension(file.name).toLowerCase();
    const normalized = allowed.map(t => t.toLowerCase().trim());
    return normalized.some(t => mime === t || ext === t || mime.startsWith(t + '/'));
  }

  isSizeAllowed(file: File, maxBytes: number | undefined): boolean {
    if (!maxBytes || maxBytes <= 0) return true;
    return file.size <= maxBytes;
  }

  getExtension(name: string): string {
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.substring(idx + 1) : '';
  }
}
