import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { History } from './pages/history/history';

export const routes: Routes = [
  { path: 'dashboard', component: Dashboard },
  { path: 'history', component: History },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];