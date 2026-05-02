import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FallAlert {
  device: string;
  message: string;
  urgencyLevel: string;
  timestamp: string;
  currentBattery: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection?: signalR.HubConnection;
  
  alertReceived$ = new Subject<FallAlert>();
  connectionStatus$ = new Subject<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR'>();

  constructor() {}

  public startConnection(deviceId: string) {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected || 
        this.hubConnection?.state === signalR.HubConnectionState.Connecting) {
      return;
    }

    // Usando a URL do arquivo de environment
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalrUrl}/monitoring?device_id=${deviceId}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection.onreconnecting(() => this.connectionStatus$.next('RECONNECTING'));
    this.hubConnection.onreconnected(() => this.connectionStatus$.next('CONNECTED'));
    this.hubConnection.onclose(() => this.connectionStatus$.next('DISCONNECTED'));

    this.hubConnection
      .start()
      .then(() => {
        console.log('--- SIGNALR CONECTADO ---');
        this.connectionStatus$.next('CONNECTED');
      })
      .catch(err => {
        console.error('Erro ao iniciar SignalR:', err);
        this.connectionStatus$.next('ERROR');
      });

    this.hubConnection.on('ReceiveAlert', (data: any) => {
      const mappedAlert: FallAlert = {
        device: data.device || data.Device,
        message: data.message || data.Message,
        urgencyLevel: data.urgencyLevel || data.UrgencyLevel,
        timestamp: data.timestamp || data.Timestamp,
        currentBattery: data.currentBattery !== undefined ? data.currentBattery : data.CurrentBattery
      };

      this.alertReceived$.next(mappedAlert);
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
