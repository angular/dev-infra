import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {LoginRoutingModule} from './login-routing.module.js';
import {LoginComponent} from './login.component.js';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {AccountModule} from '../../../../shared/account/account.module.js';

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, LoginRoutingModule, MatCardModule, MatButtonModule, AccountModule],
})
export class LoginModule {}
