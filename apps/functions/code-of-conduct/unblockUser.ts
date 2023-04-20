import {
  checkAuthenticationAndAccess,
  blockedUsersCollection,
  UnblockUserParams,
  BlockedUser,
  getAuthenticatedGithubClient,
} from './shared.js';
import {Octokit} from '@octokit/rest';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

/** Unblocks the provided user from Github, clearing their records from our listing. */
export const unblockUser = functions
  .runWith({
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  })
  .https.onCall(async ({username}: UnblockUserParams, request) => {
    await checkAuthenticationAndAccess(request);
    /** The authenticated Github client for performing actions. */
    const github = await getAuthenticatedGithubClient();
    /** The Firestore record of the user to be unblocked */
    const doc = await blockedUsersCollection().doc(username).get();

    await performUnblock(github, doc);
  });

/** Unblocks the all listed users who's block has expired, runs daily. */
export const dailyUnblock = functions
  .runWith({
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  })
  .pubsub.schedule('every day 08:00')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    /** The authenticated Github client for performing actions. */
    const github = await getAuthenticatedGithubClient();
    /** The Firestore records for all users who's block has expired. */
    const usersToUnblock = await blockedUsersCollection()
      .where('blockUntil', '<', new Date())
      .get();

    await Promise.all(usersToUnblock.docs.map(async (user) => performUnblock(github, user)));
  });

async function performUnblock(github: Octokit, doc: admin.firestore.DocumentSnapshot<BlockedUser>) {
  await github.orgs
    .unblockUser({org: 'angular', username: doc.get('username')})
    .then(() => doc.ref.delete());
}
