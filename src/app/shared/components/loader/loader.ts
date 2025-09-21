import { LoaderService } from '@/app/core/services/loader-service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss'
})
export class Loader {
  private loaderService = inject(LoaderService);
  isLoading = this.loaderService.isLoading;
}
