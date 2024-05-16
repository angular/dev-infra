import {Injectable, inject} from '@angular/core';
import {
  updateDoc,
  collection,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
  collectionSnapshots,
  Firestore,
  doc,
  getDoc,
} from '@angular/fire/firestore';
import {httpsCallable, Functions} from '@angular/fire/functions';
import {map, shareReplay} from 'rxjs';

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
  /** Firebase firestore instance, provided from the root. */
  private firestore = inject(Firestore);

  /** Request a user to be blocked by the blocking service. */
  readonly block = httpsCallable(this.functions, 'blockUser');

  /** Request a user to be unblocked by the blocking service. */
  readonly unblock = httpsCallable<UnblockUserParams>(this.functions, 'unblockUser');

  /** Request a sync of all blocked users with the current Github blockings. */
  readonly syncUsersFromGithub = httpsCallable<void>(this.functions, 'syncUsersFromGithub');

  /** All blocked users current blocked by the blocking service. */
  readonly blockedUsers = collectionSnapshots(
    collection(this.firestore, 'blockedUsers').withConverter(converter),
  ).pipe(
    map((blockedUsers) =>
      blockedUsers
        .map((snapshot) => snapshot.data())
        .sort((a, b) => (a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1)),
    ),
    shareReplay(1),
  );

  /** Update the metadata for a blocked user. */
  async update(username: string, data: Partial<BlockedUser>) {
    const userDoc = await getDoc(
      doc(collection(this.firestore, 'blockedUsers').withConverter(converter), username),
    );
    if (userDoc.exists()) {
      return await updateDoc(userDoc.ref, data);
    }
    throw Error(`The entry for ${username} does not exist`);
  }
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
