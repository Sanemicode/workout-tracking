import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { History } from './pages/history/history';
import { AuthComponent } from './pages/auth/auth';
import { AuthService } from './services/auth';
import { Landing } from './pages/landing/landing';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true; // Пропускаємо, якщо є токен
  }
  
  // Якщо токена немає - відправляємо на логін
  return router.parseUrl('/login'); 
};

export const routes: Routes = [
  { path: '', component: Landing },
  // Відкритий маршрут
  { path: 'login', component: AuthComponent },
  
  // Захищені маршрути (додано canActivate)
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'history', component: History, canActivate: [authGuard] },
  
  // Базовий редирект
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];