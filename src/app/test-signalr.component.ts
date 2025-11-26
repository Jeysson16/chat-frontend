import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

@Component({
  selector: 'app-test-signalr',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px;">
      <h2>SignalR Connection Test</h2>
      <p>Connection State: <strong>{{ connectionState }}</strong></p>
      <button (click)="connect()" [disabled]="connectionState === 'connecting'">Connect</button>
      <button (click)="disconnect()" [disabled]="connectionState === 'disconnected'">Disconnect</button>
      
      <div style="margin-top: 20px;">
        <h3>Logs:</h3>
        <div style="background: #f5f5f5; padding: 10px; height: 300px; overflow-y: auto;">
          <div *ngFor="let log of logs">{{ log }}</div>
        </div>
      </div>
    </div>
  `
})
export class TestSignalRComponent implements OnInit {
  private hubConnection: HubConnection | null = null;
  connectionState: string = 'disconnected';
  logs: string[] = [];

  ngOnInit() {
    this.addLog('Component initialized');
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.addLog('Initializing SignalR connection...');
    const hubUrl = import.meta.env.NG_APP_SIGNALR_HUB_URL;
    const apiUrl = import.meta.env.NG_APP_API_URL;
    this.addLog(`SignalR URL: ${hubUrl}`);
    this.addLog(`API URL: ${apiUrl}`);
    
    if (!hubUrl) {
      this.addLog('ERROR: SignalR hub URL is not defined');
      return;
    }
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.onclose(() => {
      this.connectionState = 'disconnected';
      this.addLog('Connection closed');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionState = 'connecting';
      this.addLog('Reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState = 'connected';
      this.addLog('Reconnected');
    });
  }

  async connect(): Promise<void> {
    if (!this.hubConnection) return;

    try {
      this.connectionState = 'connecting';
      this.addLog('Starting connection...');
      
      await this.hubConnection.start();
      
      this.connectionState = 'connected';
      this.addLog('Connection established successfully!');
    } catch (error) {
      this.connectionState = 'disconnected';
      this.addLog(`Connection failed: ${error}`);
      console.error('SignalR connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.hubConnection) return;

    try {
      await this.hubConnection.stop();
      this.connectionState = 'disconnected';
      this.addLog('Connection stopped');
    } catch (error) {
      this.addLog(`Disconnect error: ${error}`);
    }
  }

  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}