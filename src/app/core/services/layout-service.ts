import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  isCollapsed = signal(false);

  toggleCollapse(): void {
    this.isCollapsed.update(value => !value);
  }
}