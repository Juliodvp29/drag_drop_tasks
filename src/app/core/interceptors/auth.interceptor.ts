import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth-service';
import { StorageService } from '@services/storage-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);
  const router = inject(Router);

  // Lista de URLs que no requieren token
  const publicUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  // Si es una URL pública o no hay token, continuar sin modificar
  if (isPublicUrl) {
    return next(req);
  }

  // Agregar token de acceso si existe
  const token = storageService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error 401 (no autorizado), intentar refrescar el token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshAccessToken().pipe(
          switchMap((response) => {
            // Actualizar tokens
            storageService.setTokens(
              response.data.access_token,
              response.data.refresh_token
            );

            // Reintentar la petición original con el nuevo token
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data.access_token}`
              }
            });

            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            // Si falla el refresh, cerrar sesión
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};