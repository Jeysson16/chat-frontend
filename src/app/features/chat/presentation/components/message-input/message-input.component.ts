import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent],
  template: `
    <div class="flex items-center space-x-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <!-- Attachment button -->
      <app-button
        variant="ghost"
        size="sm"
        (click)="onAttachment()"
        [disabled]="disabled"
        class="p-2 flex-shrink-0"
      >
        <app-icon name="attachment" size="sm" class="text-gray-500 dark:text-gray-400"></app-icon>
      </app-button>

      <input type="file" #fileInput (change)="onFileSelected($event)" hidden />

      <!-- Message input area -->
      <div class="flex-1 relative">
        <textarea
          #messageTextarea
          [(ngModel)]="messageText"
          [placeholder]="placeholder"
          [disabled]="disabled"
          (keydown)="onKeyDown($event)"
          (input)="onInput()"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="w-full resize-none border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent max-h-32 min-h-[40px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          rows="1"
        ></textarea>
        
        <!-- Emoji button -->
        <app-button
          variant="ghost"
          size="sm"
          (click)="onEmoji()"
          [disabled]="disabled"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
        >
          <app-icon name="emoji" size="sm" class="text-gray-500 dark:text-gray-400"></app-icon>
        </app-button>
      </div>

      <!-- Voice/Send button -->
      <div class="flex-shrink-0 flex items-center gap-2">
        <!-- Pretty recording panel -->
        <div *ngIf="isRecording" class="rounded-2xl p-[1px] bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 shadow">
          <div class="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl px-3 py-2">
            <!-- Play/Pause -->
            <button (click)="togglePause()" class="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <svg *ngIf="!isPaused" class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
              <svg *ngIf="isPaused" class="w-4 h-4 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
              </svg>
            </button>

            <!-- Waveform -->
            <canvas #waveformCanvas class="h-8 w-40"></canvas>

            <!-- Timer -->
            <div class="text-xs font-mono text-gray-700 dark:text-gray-200">{{ elapsedTime }}</div>

            <!-- Stop -->
            <button (click)="onStopVoiceRecording()" class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            </button>

            <!-- Cancel -->
            <button (click)="onCancelVoiceRecording()" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">Cancelar</button>
          </div>
        </div>

        <!-- Mic button when not recording -->
        <app-button
          *ngIf="!messageText.trim() && !isRecording"
          variant="ghost"
          size="sm"
          (click)="onStartVoiceRecording()"
          [disabled]="disabled"
          class="p-2"
        >
          <app-icon name="microphone" size="sm" class="text-gray-500 dark:text-gray-400"></app-icon>
        </app-button>

        <!-- Send button when text -->
        <app-button
          *ngIf="messageText.trim()"
          variant="primary"
          size="sm"
          (click)="onSendMessage()"
          [disabled]="disabled || isSending"
          [loading]="isSending"
          class="p-2"
        >
          <app-icon name="send" size="sm" class="text-white"></app-icon>
        </app-button>
      </div>
    </div>
  `,
  styles: []
})
export class MessageInputComponent {
  @ViewChild('messageTextarea') messageTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  @Input() placeholder: string = 'Type a message...';
  @Input() disabled: boolean = false;
  @Input() isSending: boolean = false;
  @Input() maxLength: number = 1000;
  
  @Output() sendMessage = new EventEmitter<string>();
  @Output() attachmentClick = new EventEmitter<void>();
  @Output() attachmentSelected = new EventEmitter<File>();
  @Output() emojiClick = new EventEmitter<void>();
  @Output() voiceRecordingStart = new EventEmitter<void>();
  @Output() voiceRecordingStop = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();
  @Output() typing = new EventEmitter<boolean>();

  messageText: string = '';
  isRecording: boolean = false;
  audioLevel: number = 0;
  isPaused: boolean = false;
  private pausedTotalMs: number = 0;
  private pauseStart?: number;
  private recordStartTs: number = 0;
  private elapsedMs: number = 0;
  @ViewChild('waveformCanvas') waveformCanvas?: ElementRef<HTMLCanvasElement>;
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  private audioStream?: MediaStream;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private sourceNode?: MediaStreamAudioSourceNode;
  private meterTimer?: any;
  private typingTimer: any;

  onKeyDown(event: KeyboardEvent): void {
    // Send message on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
      return;
    }
    
    // Allow line break on Shift+Enter
    if (event.key === 'Enter' && event.shiftKey) {
      // Let the default behavior happen (new line)
      return;
    }
  }

  onInput(): void {
    this.adjustTextareaHeight();
    this.handleTypingIndicator();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.inputBlur.emit();
    this.typing.emit(false);
  }

  onSendMessage(): void {
    const trimmedMessage = this.messageText.trim();
    if (trimmedMessage && !this.disabled && !this.isSending) {
      this.sendMessage.emit(trimmedMessage);
      this.messageText = '';
      this.adjustTextareaHeight();
      this.typing.emit(false);
    }
  }

  onAttachment(): void {
    this.attachmentClick.emit();
    const input = this.fileInput?.nativeElement as HTMLInputElement;
    if (input) {
      input.value = '';
      input.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.attachmentSelected.emit(file);
    }
  }

  onEmoji(): void {
    this.emojiClick.emit();
  }

  onStartVoiceRecording(): void {
    if (this.disabled || this.isSending || this.isRecording) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.audioStream = stream;
      const ctx = new (window as any).AudioContext();
      this.audioContext = ctx;
      this.analyser = ctx.createAnalyser();
      this.analyser!.fftSize = 2048;
      this.sourceNode = ctx.createMediaStreamSource(stream);
      this.sourceNode!.connect(this.analyser!);
      this.recordStartTs = performance.now();
      this.pausedTotalMs = 0;
      this.isPaused = false;
      const updateAnim = () => {
        // Level (for potential future use)
        const freq = new Uint8Array(this.analyser!.frequencyBinCount);
        this.analyser!.getByteFrequencyData(freq);
        let sum = 0; for (let i = 0; i < freq.length; i++) sum += freq[i];
        this.audioLevel = Math.min(1, (sum / freq.length) / 128);

        // Waveform draw
        const canvas = this.waveformCanvas?.nativeElement;
        if (canvas) {
          const w = canvas.offsetWidth || 160;
          const h = canvas.offsetHeight || 32;
          canvas.width = w * (window.devicePixelRatio || 1);
          canvas.height = h * (window.devicePixelRatio || 1);
          const g = canvas.getContext('2d');
          if (g) {
            const time = new Uint8Array(this.analyser!.fftSize);
            this.analyser!.getByteTimeDomainData(time);
            g.clearRect(0, 0, canvas.width, canvas.height);
            g.lineWidth = 2 * (window.devicePixelRatio || 1);
            const grad = g.createLinearGradient(0, 0, canvas.width, 0);
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(0.5, '#ec4899');
            grad.addColorStop(1, '#8b5cf6');
            g.strokeStyle = grad;
            g.beginPath();
            const mid = canvas.height / 2;
            for (let i = 0; i < time.length; i++) {
              const x = (i / (time.length - 1)) * canvas.width;
              const v = (time[i] - 128) / 128;
              const y = mid + v * (mid * 0.8);
              if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.stroke();
          }
        }

        // Timer update
        const now = performance.now();
        const paused = this.isPaused && this.pauseStart ? (now - this.pauseStart) : 0;
        const effectivePaused = this.pausedTotalMs + (paused > 0 ? paused : 0);
        this.elapsedMs = Math.max(0, now - this.recordStartTs - effectivePaused);
        this.meterTimer = requestAnimationFrame(updateAnim);
      };
      updateAnim();
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = e => { if (e.data.size > 0) this.audioChunks.push(e.data); };
      this.mediaRecorder.start();
      this.isRecording = true;
      this.voiceRecordingStart.emit();
    }).catch(() => {
      this.isRecording = false;
    });
  }

  onStopVoiceRecording(): void {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.voiceRecordingStop.emit();
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const file = new File([blob], `grabacion_${Date.now()}.webm`, { type: 'audio/webm' });
          this.attachmentSelected.emit(file);
          this.audioChunks = [];
        };
        this.mediaRecorder.stop();
      }
    } finally {
      if (this.meterTimer) cancelAnimationFrame(this.meterTimer);
      this.audioLevel = 0;
      if (this.audioStream) this.audioStream.getTracks().forEach(t => t.stop());
      if (this.audioContext) this.audioContext.close();
      this.mediaRecorder = undefined;
      this.audioStream = undefined;
      this.audioContext = undefined;
      this.analyser = undefined;
      this.sourceNode = undefined;
      this.isPaused = false;
      this.pausedTotalMs = 0;
      this.pauseStart = undefined;
    }
  }

  onCancelVoiceRecording(): void {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.voiceRecordingStop.emit();
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        // Do not emit attachment on cancel
        this.mediaRecorder.stop();
      }
    } finally {
      if (this.meterTimer) cancelAnimationFrame(this.meterTimer);
      this.audioLevel = 0;
      if (this.audioStream) this.audioStream.getTracks().forEach(t => t.stop());
      if (this.audioContext) this.audioContext.close();
      this.mediaRecorder = undefined;
      this.audioStream = undefined;
      this.audioContext = undefined;
      this.analyser = undefined;
      this.sourceNode = undefined;
      this.isPaused = false;
      this.pausedTotalMs = 0;
      this.pauseStart = undefined;
    }
  }

  togglePause(): void {
    if (!this.isRecording || !this.mediaRecorder) return;
    if (!this.isPaused) {
      try { this.mediaRecorder.pause(); } catch {}
      this.isPaused = true;
      this.pauseStart = performance.now();
    } else {
      try { this.mediaRecorder.resume(); } catch {}
      this.isPaused = false;
      if (this.pauseStart) this.pausedTotalMs += performance.now() - this.pauseStart;
      this.pauseStart = undefined;
    }
  }

  get elapsedTime(): string {
    const total = Math.floor((this.elapsedMs || 0) / 1000);
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  private adjustTextareaHeight(): void {
    if (this.messageTextarea) {
      const textarea = this.messageTextarea.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
    }
  }

  private handleTypingIndicator(): void {
    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    // Emit typing start
    if (this.messageText.trim()) {
      this.typing.emit(true);
      
      // Set timer to stop typing indicator after 2 seconds of inactivity
      this.typingTimer = setTimeout(() => {
        this.typing.emit(false);
      }, 2000);
    } else {
      this.typing.emit(false);
    }
  }

  // Public method to focus the input
  focus(): void {
    if (this.messageTextarea) {
      this.messageTextarea.nativeElement.focus();
    }
  }

  // Public method to clear the input
  clear(): void {
    this.messageText = '';
    this.adjustTextareaHeight();
    this.typing.emit(false);
  }
}
