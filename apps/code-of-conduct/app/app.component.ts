import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {AccountComponent} from '../../shared/account/account.component.js';
import {BlockUserComponent} from './block-user/block-user.component.js';
import {UserTableComponent} from './user-table/user-table.component.js';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    MatToolbarModule,
    RouterModule,
    BlockUserComponent,
    AccountComponent,
    UserTableComponent,
  ],
})
export class AppComponent {}
