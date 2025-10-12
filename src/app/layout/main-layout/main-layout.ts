import { Confirmation } from "@/app/shared/components/confirmation/confirmation";
import { LayoutService } from "@/app/core/services/layout-service";
import { Loader } from "@/app/shared/components/loader/loader";
import { Toast } from "@/app/shared/components/toast/toast";
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNav } from '../side-nav/side-nav';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SideNav, Loader, Toast, Confirmation],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  private layoutService = inject(LayoutService);

  isCollapsed = this.layoutService.isCollapsed;

  getMainClasses(): string {
    const baseClasses = 'flex-1 md:ml-64 pt-20 md:pt-0 transition-all duration-300';
    const collapsedClasses = this.isCollapsed() ? 'md:ml-16' : 'md:ml-64';
    return `${baseClasses} ${collapsedClasses}`;
  }
}
