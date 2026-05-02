import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignalrService, FallAlert } from '../services/signalr.service';
import { NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.page.html',
  styleUrls: ['./alerts.page.scss'],
  standalone: false,
})
export class AlertsPage implements OnInit, OnDestroy {
  deviceId: string | null = '';
  alerts: FallAlert[] = [];
  status: string = 'Iniciando...';
  private alertSubscription?: Subscription;
  private statusSubscription?: Subscription;

  constructor(
    private signalrService: SignalrService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'target_device_id' });
    this.deviceId = value;
    
    if (!this.deviceId) {
      this.navCtrl.navigateRoot('/home');
      return;
    }

    await LocalNotifications.requestPermissions();

    this.signalrService.startConnection(this.deviceId);

    this.alertSubscription = this.signalrService.alertReceived$.subscribe((alert) => {
      this.alerts.unshift(alert);
      this.triggerVibration(alert.urgencyLevel);
      this.showLocalNotification(alert);
    });

    this.statusSubscription = this.signalrService.connectionStatus$.subscribe(async (status) => {
      switch (status) {
        case 'CONNECTED':
          this.status = '🟢 Conectado';
          this.startForegroundService();
          break;
        case 'RECONNECTING':
          this.status = '🟡 Tentando Reconectar...';
          this.showToast('Conexão instável. Tentando reconectar...', 'warning');
          break;
        case 'DISCONNECTED':
        case 'ERROR':
          this.status = '🔴 Desconectado';
          this.triggerVibration('CRITICAL');
          this.showToast('ERRO DE CONEXÃO! O monitoramento parou.', 'danger');
          break;
      }
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      if (notification.actionId === 'disconnect') {
        this.disconnect();
      }
    });

    App.addListener('backButton', () => {
      if (window.location.pathname.includes('/alerts')) {
        App.minimizeApp();
      }
    });
  }

  ngOnDestroy() {
    this.stopForegroundService();
    this.signalrService.stopConnection();
    this.alertSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    LocalNotifications.removeAllListeners();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  async startForegroundService() {
    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Alertas',
        importance: 5,
        visibility: 1
      });

      await ForegroundService.startForegroundService({
        id: 12345,
        title: 'Monitoramento Ativo',
        body: `Alert Client conectado à pulseira ${this.deviceId}`,
        smallIcon: 'ic_launcher'
      });
    } catch (e) {
      console.error('--- ERRO AO INICIAR FOREGROUND SERVICE ---', e);
    }
  }

  async stopForegroundService() {
    try {
      await ForegroundService.stopForegroundService();
    } catch (e) {
      console.error('Erro ao parar Foreground Service:', e);
    }
  }

  async triggerVibration(level: string) {
    try {
      if (level === 'CRITICAL') {
        await Haptics.vibrate({ duration: 500 });
      } else if (level === 'WARNING') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (e) {
      if (navigator.vibrate) {
        navigator.vibrate(level === 'CRITICAL' ? 500 : 100);
      }
    }
  }

  async showLocalNotification(alert: FallAlert) {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'ALERT_ACTIONS',
          actions: [
            { id: 'view', title: 'Ver Alerta' },
            { id: 'disconnect', title: 'Desconectar', destructive: true }
          ]
        }
      ]
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          title: `Alerta: ${alert.message}`,
          body: `Dispositivo: ${alert.device} - Bateria: ${alert.currentBattery}%`,
          id: Math.floor(Math.random() * 1000000),
          actionTypeId: 'ALERT_ACTIONS',
          extra: { deviceId: alert.device }
        }
      ]
    });
  }

  async disconnect() {
    await this.stopForegroundService();
    this.signalrService.stopConnection();
    await Preferences.remove({ key: 'target_device_id' });
    this.navCtrl.navigateRoot('/home');
  }

  clearAlerts() {
    this.alerts = [];
  }

  async goBack() {
    await this.disconnect();
  }
}
