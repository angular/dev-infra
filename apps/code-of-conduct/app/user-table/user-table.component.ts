import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlockedUser, BlockService} from '../block.service.js';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {BlockUserComponent} from '../block-user/block-user.component.js';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'user-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {showDelay: 750}}],
})
export class UserTableComponent {
  readonly columns = ['username', 'blockUntil', 'blockedBy', 'actions'];
  blockService = inject(BlockService);
  private dialog = inject(MatDialog);
  forceSyncInProgress = false;

  editUser(user: BlockedUser) {
    this.dialog.open(BlockUserComponent, {data: {editMode: true, user}});
  }

  forceSync() {
    this.forceSyncInProgress = true;
    this.blockService.syncUsersFromGithub().finally(() => (this.forceSyncInProgress = false));
  }
}
