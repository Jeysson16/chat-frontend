import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatApiServiceNew {
  private readonly apiUrl = import.meta.env.NG_APP_API_URL || 'http://localhost:5278/api';

  constructor(private http: HttpClient) {}

  // Chat API methods will be implemented here
  // This is a placeholder for the new chat API service
}