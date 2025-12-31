import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-image-editor-presenter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <canvas #canvas class="max-h-40 max-w-full rounded border border-gray-200 dark:border-gray-700"></canvas>
      <div class="flex gap-2">
        <button (click)="rotate(90)" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded">Rotar 90°</button>
        <button (click)="flipH()" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded">Voltear H</button>
        <button (click)="cropSquare()" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 rounded">Recorte 1:1</button>
        <button (click)="emitEdited()" class="px-2 py-1 text-xs bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded">Aplicar</button>
      </div>
    </div>
  `
})
export class ImageEditorPresenter implements OnChanges {
  @Input() file!: File;
  @Output() edited = new EventEmitter<File>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private image = new Image();
  private rotation = 0; // degrees
  private flip = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['file'] && this.file) {
      this.loadImage();
    }
  }

  private loadImage(): void {
    const url = URL.createObjectURL(this.file);
    this.image.onload = () => {
      URL.revokeObjectURL(url);
      this.render();
    };
    this.image.src = url;
  }

  private render(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const w = this.image.width;
    const h = this.image.height;
    const rad = (this.rotation % 360) * Math.PI / 180;

    const is90 = Math.abs(this.rotation % 180) === 90;
    canvas.width = is90 ? h : w;
    canvas.height = is90 ? w : h;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.scale(this.flip ? -1 : 1, 1);
    ctx.drawImage(this.image, -w / 2, -h / 2);
    ctx.restore();
  }

  rotate(deg: number): void { this.rotation = (this.rotation + deg) % 360; this.render(); }
  flipH(): void { this.flip = !this.flip; this.render(); }

  cropSquare(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const size = Math.min(canvas.width, canvas.height);
    const tmp = document.createElement('canvas');
    tmp.width = size; tmp.height = size;
    const ctx = tmp.getContext('2d')!;
    const sx = (canvas.width - size) / 2;
    const sy = (canvas.height - size) / 2;
    ctx.drawImage(canvas, sx, sy, size, size, 0, 0, size, size);
    const url = tmp.toDataURL(this.file.type || 'image/png', 0.92);
    this.replaceFromDataUrl(url);
  }

  private replaceFromDataUrl(dataUrl: string): void {
    fetch(dataUrl).then(res => res.arrayBuffer()).then(buf => {
      const ext = (this.file.name.split('.').pop() || 'png').toLowerCase();
      const type = this.file.type || (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png');
      const f = new File([buf], this.file.name, { type });
      this.file = f;
      this.loadImage();
    });
  }

  emitEdited(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.toBlob(blob => {
      if (!blob) return;
      const f = new File([blob], this.file.name, { type: this.file.type || blob.type });
      this.edited.emit(f);
    }, this.file.type || 'image/png', 0.92);
  }
}
