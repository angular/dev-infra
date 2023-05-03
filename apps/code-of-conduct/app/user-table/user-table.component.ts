import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BlockedUser, BlockService} from '../block.service.js';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatIconModule} from '@angular/material/icon';
import {MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
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

  async unblock(user: any) {
    user.inProgress = true;
    const dialogRef = this.dialog.open(UnblockConfirmation, {
      data: {username: user.username},
    });
    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result === true) {
        await this.blockService.unblock(user);
      }
      user.inProgress = false;
    });
  }
}

@Component({
  selector: 'unblock-confirmation',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <mat-dialog-content>
      <span>Are you sure you want to unblock {{ username }}?</span>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(false)">Cancel</button>
      <button mat-raised-button color="primary" (click)="dialogRef.close(true)">Confirm</button>
    </mat-dialog-actions>
  `,
})
export class UnblockConfirmation {
  private data = inject(MAT_DIALOG_DATA);
  username = this.data.username;
  public dialogRef = inject(MatDialogRef);
}
