// loader.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { inject } from '@angular/core';
import { LoaderService } from '@services/loader-service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};