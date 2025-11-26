import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../../shared/components/atoms/button/button.component';
import { IconComponent } from '../../../../../shared/components/atoms/icon/icon.component';

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
          class="w-full resize-none border border-gray-300 dark:border-gray-800 rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 min-h-[40px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
        <span *ngIf="isRecording" class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 animate-pulse">Grabando…</span>
        <div *ngIf="isRecording" class="h-2 w-24 bg-red-50 rounded overflow-hidden">
          <div class="h-full bg-red-500" [style.width.%]="audioLevel * 100"></div>
        </div>
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
        
        <app-button
          *ngIf="!messageText.trim() && isRecording"
          variant="danger"
          size="sm"
          (click)="onStopVoiceRecording()"
          class="p-2 animate-pulse"
        >
          <app-icon name="microphone" size="sm" class="text-white"></app-icon>
        </app-button>
        
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
      const updateMeter = () => {
        const buffer = new Uint8Array(this.analyser!.frequencyBinCount);
        this.analyser!.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length;
        this.audioLevel = Math.min(1, avg / 128);
        this.meterTimer = requestAnimationFrame(updateMeter);
      };
      updateMeter();
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
    }
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
