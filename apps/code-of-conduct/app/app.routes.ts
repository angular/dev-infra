import {Routes} from '@angular/router';
import {isLoggedInGuard} from '../../shared/account/account.guard.js';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component.js').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [isLoggedInGuard],
    loadComponent: () => import('./main/main.component.js').then((m) => m.MainComponent),
  },
];
