import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-editor-presenter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-2 w-full">
      <video #video [src]="previewUrl" controls class="w-full max-h-40"></video>
      <div class="flex items-center gap-2 text-xs">
        <span>Inicio</span>
        <input type="range" min="0" [max]="duration" step="0.1" [(ngModel)]="start" class="flex-1" />
        <span>{{ start | number:'1.0-1' }}s</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span>Fin</span>
        <input type="range" min="0" [max]="duration" step="0.1" [(ngModel)]="end" class="flex-1" />
        <span>{{ end | number:'1.0-1' }}s</span>
      </div>
      <div class="flex gap-2">
        <button (click)="captureThumbnail()" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded">Miniatura</button>
        <button disabled class="px-2 py-1 text-xs bg-gray-300 text-gray-600 rounded" title="Recorte avanzado no disponible">Recortar (experimental)</button>
      </div>
      <img *ngIf="thumbnailUrl" [src]="thumbnailUrl" class="h-16 rounded border border-gray-200 dark:border-gray-700" />
    </div>
  `
})
export class VideoEditorPresenter {
  private _file!: File;
  @Input() set file(f: File) { this._file = f; this.refreshPreview(); }
  get file(): File { return this._file; }
  @Output() edited = new EventEmitter<File>();
  @Output() thumbnail = new EventEmitter<File>();
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  previewUrl: string = '';
  duration: number = 0;
  start: number = 0;
  end: number = 0;
  thumbnailUrl: string = '';

  private refreshPreview(): void {
    try { if (this.previewUrl) URL.revokeObjectURL(this.previewUrl); } catch {}
    this.previewUrl = URL.createObjectURL(this._file);
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.onloadedmetadata = () => {
        this.duration = video.duration || 0;
        this.start = 0;
        this.end = this.duration;
      };
    }
  }

  captureThumbnail(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(video.videoWidth));
    canvas.height = Math.max(1, Math.floor(video.videoHeight));
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (!blob) return;
      const thumb = new File([blob], this._file.name.replace(/\.(\w+)$/, '_thumb.png'), { type: 'image/png' });
      this.thumbnailUrl = URL.createObjectURL(thumb);
      this.thumbnail.emit(thumb);
    }, 'image/png');
  }
}
