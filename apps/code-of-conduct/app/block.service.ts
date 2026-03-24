import {Injectable, inject} from '@angular/core';
import {QueryDocumentSnapshot, FirestoreDataConverter} from '@angular/fire/firestore';
import {httpsCallable, Functions} from '@angular/fire/functions';
import {map, shareReplay, from, switchMap, BehaviorSubject} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

export interface BlockUserParams {
  /** The username of the user being blocked. */
  username: string;
  /** The date to block the user until, or false if the block is indefinite. */
  blockUntil: Date | false;
  /** A statement or link to the context for the blocking. */
  context: string;
  /** Additional comments about the user block. */
  comments: string;
}

export interface UnblockUserParams {
  /** The username of the user being unblocked. */
  username: string;
}

export interface BlockedUser extends BlockUserParams {
  /** The display name of the person who blocked the user. */
  blockedBy: string;
  /** The date the block began. */
  blockedOn: Date;
}

export type BlockedUserFromFirestore = BlockedUser & {
  /** The date the block began, as a unix timestamp */
  blockedOn: number;
  /** The date the block ends, as a unix timestamp, or false if the block is indefinite. */
  blockUntil: number | false;
};

@Injectable({providedIn: 'root'})
export class BlockService {
  /** Firebase functions instance, provided from the root. */
  private functions = inject(Functions);
  /** Snackbar for displaying failure alerts. */
  private snackBar = inject(MatSnackBar);
  /** Subject to trigger refreshing the blocked users list. */
  private refreshBlockedUsers$ = new BehaviorSubject<void>(undefined);

  /** Request all blocked users. */
  getBlockedUsers = this.asCallable<void, BlockedUserFromFirestore[]>('getBlockedUsers', true);

  /** All blocked users current blocked by the blocking service. */
  readonly blockedUsers = this.refreshBlockedUsers$.pipe(
    switchMap(() => from(this.getBlockedUsers())),
    map((blockedUsers) =>
      blockedUsers
        .map((user) => ({
          ...user,
          blockUntil: user.blockUntil === false ? false : new Date(user.blockUntil),
          blockedOn: new Date(user.blockedOn),
        }))
        .sort((a, b) => (a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1)),
    ),
    shareReplay(1),
  );

  /** Request a user to be blocked. */
  block = this.asCallable<BlockUserParams, void>('blockUser');

  /** Request a user to be unblocked. */
  unblock = this.asCallable<UnblockUserParams, void>('unblockUser');

  /** Request a sync of all blocked users with the current Github blockings. */
  syncUsersFromGithub = this.asCallable<void, void>('syncUsersFromGithub');

  /** Update the metadata for a blocked user. */
  update = this.asCallable<{username: string; data: Partial<BlockedUser>}, void>('updateUser');

  /**
   * Helper function to create a callable function that automatically refreshes the blocked users list.
   * @param callableName The name of the callable function to create.
   * @returns A function that can be called to invoke the callable function.
   */
  private asCallable<T, R>(
    callableName: string,
    skipRefresh = false,
  ): (callableArg: T) => Promise<R> {
    return async (callableArg: T) => {
      try {
        const result = await httpsCallable<T, R>(this.functions, callableName)(callableArg);
        if (!skipRefresh) {
          this.refreshBlockedUsers$.next();
        }
        return result.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.snackBar.open(`Failed to execute ${callableName}: ${message}`, 'Dismiss', {
          duration: 5000,
        });
        throw error;
      }
    };
  }
}
