import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from '../../../../shared/account/account.service.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private account: AccountService, private router: Router) {}

  signIn() {
    this.account.signInWithGoogle().then((signedIn) => {
      if (signedIn) {
        this.router.navigateByUrl('');
      }
    });
  }
}
