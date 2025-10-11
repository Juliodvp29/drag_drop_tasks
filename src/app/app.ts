import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from "./shared/components/toast/toast";
import { Confirmation } from "./shared/components/confirmation/confirmation";
import { StorageService } from './core/services/storage-service';
import { ThemeService } from './core/services/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, Confirmation],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('drag_drop_tasks');

  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Cargar tema desde configuraciones del usuario al iniciar la app
    const userSettings = this.storageService.getUserSettings();
    if (userSettings?.theme) {
      this.themeService.loadFromUserSettings(userSettings.theme);
    }
  }
}
