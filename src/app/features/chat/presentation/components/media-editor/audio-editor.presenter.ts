import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, Output, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-audio-editor-presenter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-3">
      <!-- Card -->
      <div class="rounded-2xl p-[1px] bg-gradient-to-r from-[var(--primary-color)] via-indigo-500 to-purple-500">
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-3">
          <!-- Transport & Time -->
          <div class="flex items-center gap-3 mb-2">
            <button (click)="togglePreview()" class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg *ngIf="!isPlaying" class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>
              <svg *ngIf="isPlaying" class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>
            </button>
            <div class="text-xs font-mono text-gray-700 dark:text-gray-200">{{ currentTime | number:'1.0-2' }} / {{ duration | number:'1.0-2' }} s</div>
          </div>

          <!-- Waveform with trim region -->
          <canvas #waveCanvas class="w-full h-16 rounded bg-gray-50 dark:bg-gray-800"></canvas>
          <audio #audioEl [src]="previewUrl" (timeupdate)="onTimeUpdate(audioEl.currentTime)" (ended)="onEnded()" class="hidden"></audio>

          <!-- Trim sliders -->
          <div class="mt-3 space-y-2">
            <div class="flex items-center gap-2 text-xs">
              <span>Inicio</span>
              <input type="range" min="0" [max]="duration" step="0.01" [(ngModel)]="start" (ngModelChange)="redraw()" class="flex-1 accent-[var(--primary-color)]" />
              <span>{{ start | number:'1.0-2' }}s</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span>Fin</span>
              <input type="range" min="0" [max]="duration" step="0.01" [(ngModel)]="end" (ngModelChange)="redraw()" class="flex-1 accent-purple-500" />
              <span>{{ end | number:'1.0-2' }}s</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-3 flex gap-2">
            <button (click)="applyTrim()" class="px-3 py-1 text-xs bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-white rounded">Recortar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AudioEditorPresenter {
  private _file!: File;
  @Input() set file(f: File) { this._file = f; this.refreshPreview(); }
  get file(): File { return this._file; }
  @Output() edited = new EventEmitter<File>();

  previewUrl: string = '';
  duration: number = 0;
  start: number = 0;
  end: number = 0;
  currentTime: number = 0;
  isPlaying: boolean = false;
  private peaks: number[] = [];
  private peakRate: number = 100; // samples per peak
  private drawRAF?: number;
  @ViewChild('waveCanvas') waveCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('audioEl') audioEl!: ElementRef<HTMLAudioElement>;

  private async refreshPreview(): Promise<void> {
    try {
      if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    } catch {}
    this.previewUrl = URL.createObjectURL(this._file);
    // Probe duration using AudioContext
    try {
      const arr = await this._file.arrayBuffer();
      const ctx = new (window as any).AudioContext();
      const buf = await ctx.decodeAudioData(arr);
      this.duration = buf.duration;
      this.start = 0;
      this.end = buf.duration;
      // Build waveform peaks
      this.peaks = this.buildPeaks(buf);
      this.redraw();
      ctx.close();
    } catch {}
  }

  async applyTrim(): Promise<void> {
    const arrayBuffer = await this._file.arrayBuffer();
    const ctx = new (window as any).AudioContext();
    const original = await ctx.decodeAudioData(arrayBuffer);
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const s = clamp(this.start, 0, original.duration);
    const e = clamp(this.end, s, original.duration);
    const length = Math.floor((e - s) * original.sampleRate);
    const trimmed = ctx.createBuffer(original.numberOfChannels, length, original.sampleRate);
    for (let ch = 0; ch < original.numberOfChannels; ch++) {
      const data = original.getChannelData(ch);
      const cut = trimmed.getChannelData(ch);
      const startIndex = Math.floor(s * original.sampleRate);
      for (let i = 0; i < length; i++) { cut[i] = data[startIndex + i] || 0; }
    }

    const dest = ctx.createMediaStreamDestination();
    const src = ctx.createBufferSource();
    src.buffer = trimmed;
    src.connect(dest);
    const mr = new (window as any).MediaRecorder(dest.stream);
    const chunks: Blob[] = [];
    const done = new Promise<Blob>(resolve => {
      mr.ondataavailable = (e: any) => { if (e.data?.size) chunks.push(e.data); };
      mr.onstop = () => resolve(new Blob(chunks, { type: this._file.type || 'audio/webm' }));
    });
    mr.start();
    src.start();
    await new Promise(r => setTimeout(r, (e - s) * 1000 + 50));
    mr.stop();
    src.disconnect();
    ctx.close();
    const blob = await done;
    const f = new File([blob], this._file.name.replace(/\.(\w+)$/, '.webm'), { type: blob.type });
    this.edited.emit(f);
    this.refreshPreview();
  }

  ngAfterViewInit(): void {
    // Ensure initial draw after view is ready
    if (this.peaks && this.peaks.length) {
      setTimeout(() => this.redraw(), 0);
    }
  }

  togglePreview(): void {
    const el = this.audioEl?.nativeElement;
    if (!el) return;
    if (!this.isPlaying) {
      el.currentTime = Math.min(Math.max(this.start, 0), this.end || this.duration);
      el.play().catch(() => {});
      this.isPlaying = true;
    } else {
      el.pause();
      this.isPlaying = false;
    }
  }

  onTimeUpdate(t: number): void {
    this.currentTime = t;
    this.redraw();
    // Auto-stop at end trim
    if (this.currentTime >= this.end) this.onEnded();
  }

  onEnded(): void {
    const el = this.audioEl?.nativeElement;
    if (el) el.pause();
    this.isPlaying = false;
  }

  private buildPeaks(buf: AudioBuffer): number[] {
    const ch = buf.getChannelData(0);
    const total = ch.length;
    const samplesPerPeak = Math.max(1, Math.floor(total / (buf.duration * 400))); // ~400 px width baseline
    const out: number[] = [];
    for (let i = 0; i < total; i += samplesPerPeak) {
      let min = 1, max = -1;
      for (let j = i; j < Math.min(i + samplesPerPeak, total); j++) {
        const v = ch[j];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      out.push(Math.max(Math.abs(min), Math.abs(max)));
    }
    this.peakRate = samplesPerPeak;
    return out;
  }

  redraw(): void {
    const canvas = this.waveCanvas?.nativeElement;
    if (!canvas) return;
    const dpr = (window as any).devicePixelRatio || 1;
    const w = canvas.offsetWidth || 400;
    const h = canvas.offsetHeight || 64;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const g = canvas.getContext('2d');
    if (!g) return;
    g.clearRect(0, 0, canvas.width, canvas.height);
    const mid = canvas.height / 2;
    const barW = Math.max(1, Math.floor(canvas.width / this.peaks.length));
    const grad = g.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#8b5cf6');
    // Draw peaks
    for (let i = 0; i < this.peaks.length; i++) {
      const amp = this.peaks[i];
      const x = i * barW;
      const y = amp * (mid * 0.9);
      g.fillStyle = grad;
      g.fillRect(x, mid - y, Math.max(1, barW - 1), y * 2);
    }
    // Highlight trim region
    const startX = Math.max(0, Math.min(canvas.width, (this.start / this.duration) * canvas.width));
    const endX = Math.max(startX, Math.min(canvas.width, (this.end / this.duration) * canvas.width));
    g.fillStyle = 'rgba(59, 130, 246, 0.12)';
    g.fillRect(startX, 0, Math.max(2, endX - startX), canvas.height);
    // Playhead
    const playX = Math.max(0, Math.min(canvas.width, (this.currentTime / this.duration) * canvas.width));
    g.fillStyle = '#ef4444';
    g.fillRect(playX, 0, Math.max(2, Math.floor(dpr)), canvas.height);
  }
}
