import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { guestGuard } from '@guards/guest.guard';
import { permissionGuard } from '@guards/permission.guard';
import { MainLayout } from '@layout/main-layout/main-layout';

export const routes: Routes = [
  // Rutas de autenticación (solo para invitados)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login')
          .then(r => r.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register')
          .then(r => r.Register)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password')
          .then(r => r.ForgotPassword)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password')
          .then(r => r.ResetPassword)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  // rutas admin
  {
    path: 'admin',
    component: MainLayout,
    canActivate: [authGuard, permissionGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/users-management/users-management')
            .then(m => m.UsersManagement),
        data: {
          permissions: ['users.view'],
          requireAll: false,
          title: 'Gestión de Usuarios'
        }
      },
      {
        path: 'settings-profile',
        loadComponent: () =>
          import('./pages/admin/settings-profile/settings-profile')
            .then(m => m.SettingsProfile),
        data: {
          permissions: ['profile.view'],
          requireAll: false,
          title: 'Configuración de Perfil'
        }
      }
    ]
  },
  // Rutas protegidas (requieren autenticación)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home')
          .then(r => r.Home)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks')
          .then(r => r.Tasks),
        canActivate: [permissionGuard],
        data: {
          permissions: ['tasks.view'],
          requireAll: false
        }
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar/calendar')
          .then(r => r.Calendar),
        canActivate: [permissionGuard],
        data: {
          permissions: ['calendar.view'],
          requireAll: false
        }
      },
      // Ruta de no autorizado
      {
        path: 'unauthorized',
        loadComponent: () => import('./pages/auth/unauthorized/unauthorized')
          .then(r => r.Unauthorized)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];