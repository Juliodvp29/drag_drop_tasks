import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StorageService } from './core/services/storage-service';
import { ThemeService } from './core/services/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('drag_drop_tasks');

  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    const userSettings = this.storageService.getUserSettings();
    if (userSettings?.theme) {
      this.themeService.loadFromUserSettings(userSettings.theme);
    }
  }
}
