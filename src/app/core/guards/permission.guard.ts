import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth-service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Obtener permisos requeridos de la ruta
  const requiredPermissions = route.data['permissions'] as string[];
  const requireAll = route.data['requireAll'] as boolean || false;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  // Verificar permisos
  const hasPermission = requireAll
    ? authService.hasAllPermissions(requiredPermissions)
    : authService.hasAnyPermission(requiredPermissions);

  if (!hasPermission) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
