import { Routes } from '@angular/router';
import { MainLayout } from '@layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home')
          .then(r => r.Home)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks')
          .then(r => r.Tasks)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./pages/calendar/calendar')
          .then(r => r.Calendar)
      },
      { path: '**', redirectTo: '' } // Opcional: para redirigir rutas no encontradas
    ]
  }
];
