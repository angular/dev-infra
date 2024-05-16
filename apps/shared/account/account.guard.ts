import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {AccountService} from './account.service.js';

export const isLoggedInGuard = async () => {
  const account = inject(AccountService);
  const router = inject(Router);

  if (!(await firstValueFrom(account.isLoggedIn$))) {
    // TODO: Determine a way to better manage the path used.
    router.navigate(['login']);
    return false;
  }
  return true;
};
