import {CommonModule} from '@angular/common';
import {Component, inject, NgZone} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {Router} from '@angular/router';
import {AccountService} from '../../../shared/account/account.service.js';

@Component({
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule],
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private router = inject(Router);
  private account = inject(AccountService);
  private zone = inject(NgZone);

  private unsubscribe = this.account.isLoggedIn$.subscribe((loggedIn) => {
    if (loggedIn) {
      this.zone.run(() => {
        this.router.navigateByUrl('');
      });
    }
  });

  signIn() {
    this.account.signInWithGoogle();
  }
  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
