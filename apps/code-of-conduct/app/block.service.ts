import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Injectable} from '@angular/core';
import {
  updateDoc,
  onSnapshot,
  collection,
  getFirestore,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from '@angular/fire/firestore';
import {httpsCallable, getFunctions} from '@angular/fire/functions';
import {BehaviorSubject} from 'rxjs';

export interface BlockUserParams {
  username: string;
  blockUntil: Date | false;
  context: string;
  comments: string;
}

export interface UnblockUserParams {
  username: string;
}

export interface BlockedUser extends BlockUserParams {
  blockedBy: string;
  blockedOn: Date;
}

export type BlockedUserFromFirestore = BlockedUser & {
  blockedOn: number;
  blockUntil: number | false;
};

@Injectable({
  providedIn: 'any',
})
export class BlockService {
  private firestore = getFirestore();
  private usersCollection = collection(this.firestore, 'blockedUsers').withConverter(converter);

  public blockedUsers = new BehaviorSubject<QueryDocumentSnapshot<BlockedUser>[]>([]);

  constructor() {
    onSnapshot(this.usersCollection, (snapshot) => {
      this.blockedUsers.next(
        snapshot.docs.sort((a, b) => (a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1)),
      );
    });
  }

  private blockCallable = httpsCallable<BlockUserParams>(getFunctions(), 'blockUser');
  async block(user: BlockUserParams) {
    return this.blockCallable(user);
  }

  dialog = inject(MatDialog, {optional: true});
  private unblockCallable = httpsCallable<UnblockUserParams>(getFunctions(), 'unblockUser');
  async unblock(
    user: QueryDocumentSnapshot<BlockedUserFromFirestore>,
    state: {inProgress: boolean},
  ) {
    state.inProgress = true;
    if (this.dialog) {
      const dialogRef = this.dialog.open(UnblockConfirmation, {
        data: {
          username: user.get('username'),
        },
      });
      dialogRef.afterClosed().subscribe(async (result: boolean) => {
        if (result === true) {
          await this.unblockCallable({username: user.get('username')});
        }
        state.inProgress = false;
      });
    }
  }

  async update(
    user: QueryDocumentSnapshot<BlockedUserFromFirestore>,
    data: Partial<BlockUserParams>,
  ) {
    return await updateDoc(user.ref, data);
  }

  private syncUsersFromGithubCallable = httpsCallable(getFunctions(), 'syncUsersFromGithub');
  async syncUsersFromGithub() {
    return await this.syncUsersFromGithubCallable();
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

export const converter: FirestoreDataConverter<BlockedUser> = {
  toFirestore: (user: BlockedUser) => {
    return user;
  },
  fromFirestore: (data: QueryDocumentSnapshot<BlockedUser>) => {
    return {
      username: data.get('username'),
      context: data.get('context'),
      comments: data.get('comments'),
      blockedBy: data.get('blockedBy'),
      blockUntil:
        data.get('blockUntil') === false ? false : new Date(data.get('blockUntil').seconds * 1000),
      blockedOn: new Date(data.get('blockedOn').seconds * 1000),
    };
  },
};
