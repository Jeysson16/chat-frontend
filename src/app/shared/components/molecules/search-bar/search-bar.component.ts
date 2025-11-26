import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../atoms/input/input.component';
import { IconComponent } from '../../atoms/icon/icon.component';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, InputComponent, IconComponent],
  template: `
    <div class="relative">
      <app-input
        [placeholder]="placeholder"
        [disabled]="disabled"
        [hasPrefix]="true"
        (inputChange)="onSearchChange($event)"
        (inputFocus)="onFocus()"
        (inputBlur)="onBlur()"
        class="w-full"
      >
        <app-icon 
          slot="prefix" 
          name="search" 
          size="sm" 
          class="text-gray-400"
        ></app-icon>
      </app-input>
      
      <!-- Clear button when there's text -->
      <button
        *ngIf="searchValue && showClearButton"
        (click)="clearSearch()"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <app-icon name="x" size="sm"></app-icon>
      </button>
    </div>
  `,
  styles: []
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search messages, people...';
  @Input() disabled: boolean = false;
  @Input() showClearButton: boolean = true;
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchFocus = new EventEmitter<void>();
  @Output() searchBlur = new EventEmitter<void>();
  @Output() searchClear = new EventEmitter<void>();

  searchValue: string = '';

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchChange.emit(value);
  }

  onFocus(): void {
    this.searchFocus.emit();
  }

  onBlur(): void {
    this.searchBlur.emit();
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchChange.emit('');
    this.searchClear.emit();
  }
}