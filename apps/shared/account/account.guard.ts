import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {AccountService} from './account.service.js';

export const isLoggedInGuard = async () => {
  const account = inject(AccountService);
  const router = inject(Router);

  if (!(await firstValueFrom(account.isLoggedIn$))) {
    router.navigate(['login']);
    return false;
  }
  return true;
};
