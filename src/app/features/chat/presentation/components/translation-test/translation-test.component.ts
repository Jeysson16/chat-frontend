import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-translation-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-gray-100 rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Translator API Test</h3>
      
      <div class="space-y-4">
        <div>
          <h4 class="font-medium">API Availability:</