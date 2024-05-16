import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {BlockUserComponent} from '../block-user/block-user.component.js';
import {UserTableComponent} from '../user-table/user-table.component.js';

@Component({
  standalone: true,
  imports: [CommonModule, UserTableComponent, MatDialogModule, MatButtonModule, MatIconModule],
  selector: 'main',
  styleUrls: ['./main.component.scss'],
  templateUrl: './main.component.html',
})
export class MainComponent {
  private dialog = inject(MatDialog);

  /** Open the block user dialog */
  openBlockDialog() {
    this.dialog.open(BlockUserComponent);
  }
}
