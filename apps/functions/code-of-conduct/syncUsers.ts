import {
  blockedUsersCollection as getBlockedUsersCollection,
  getAuthenticatedGithubClient,
  checkAuthenticationAndAccess,
} from './shared.js';
import * as functions from 'firebase-functions';

/** Runs the synchronization of blocked users from Github to the blocked users once per day. */
export const dailySync = functions
  .runWith({
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  })
  .pubsub.schedule('every day 08:00')
  .timeZone('America/Los_Angeles')
  .onRun(syncUsers);

/** Runs the synchronization of blocked users from Github to the blocked users list on demand. */
export const syncUsersFromGithub = functions
  .runWith({
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  })
  .https.onCall(async (_: void, context) => {
    await checkAuthenticationAndAccess(context);
    await syncUsers();
  });

async function syncUsers() {
  /** The authenticated Github client for performing actions. */
  const github = await getAuthenticatedGithubClient();
  /** The firestore collection for blocked users */
  const blockedUsersCollection = getBlockedUsersCollection();
  /** A Firestore batch, allowing for atomic updating of the blocked users. */
  const writeBatch = blockedUsersCollection.firestore.batch();

  /**
   * A Date object one year from today, the default block length applied for users discovered
   * from Githubs listing.
   */
  const oneYearFromToday = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  })();

  /** All of the currently blocked users for the Angular organization. */
  const blockedUsers = await github.paginate(github.orgs.listBlockedUsers, {
    org: 'angular',
    per_page: 100,
  });

  for (let blockedUser of blockedUsers) {
    const firebaseUser = await blockedUsersCollection.doc(blockedUser.login).get();
    // For users we already know about from Github, we skip their records.
    if (firebaseUser.exists) {
      continue;
    }

    writeBatch.create(firebaseUser.ref, {
      blockedBy: 'Imported From Github',
      blockedOn: new Date(),
      blockUntil: oneYearFromToday,
      comments: 'This record was automatically imported from Github',
      context: 'Unknown',
      username: blockedUser.login,
    });
  }
  await writeBatch.commit();
}
