import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative">
      <!-- Prefix slot -->
      <div *ngIf="hasPrefix" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <ng-content select="[slot=prefix]"></ng-content>
      </div>
      
      <input
        [type]="type"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        [ngClass]="inputClasses"
        class="w-full border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      <!-- Suffix slot -->
      <div *ngIf="hasSuffix" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <ng-content select="[slot=suffix]"></ng-content>
      </div>
    </div>
    
    <!-- Error message -->
    <div *ngIf="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() hasPrefix: boolean = false;
  @Input() hasSuffix: boolean = false;
  @Input() error: string = '';
  
  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value: string = '';
  
  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputClasses(): string {
    const sizeClasses = this.getSizeClasses();
    const paddingClasses = this.getPaddingClasses();
    const borderClasses = this.error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
    
    return `${sizeClasses} ${paddingClasses} ${borderClasses}`;
  }

  private getSizeClasses(): string {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return sizes[this.size];
  }

  private getPaddingClasses(): string {
    const leftPadding = this.hasPrefix ? 'pl-10' : 'pl-3';
    const rightPadding = this.hasSuffix ? 'pr-10' : 'pr-3';
    
    const sizes = {
      sm: 'py-1.5',
      md: 'py-2',
      lg: 'py-3'
    };
    
    return `${leftPadding} ${rightPadding} ${sizes[this.size]}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}