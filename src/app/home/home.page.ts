import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  deviceId: string = '';

  constructor(private router: Router) {}

  async ngOnInit() {
    const { value } = await Preferences.get({ key: 'target_device_id' });
    if (value) {
      this.deviceId = value;
      setTimeout(() => {
        this.router.navigate(['/alerts']);
      }, 500);
    }
  }

  async connect() {
    if (this.deviceId.trim() && this.deviceId.length <= 100) {
      await Preferences.set({
        key: 'target_device_id',
        value: this.deviceId.trim()
      });
      this.router.navigate(['/alerts']);
    } else if (this.deviceId.length > 100) {
      alert('O ID do dispositivo deve ter no máximo 100 caracteres.');
    }
  }
}
