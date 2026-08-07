import {
  checkAuthenticationAndAccess,
  blockedUsersCollection,
  UnblockUserParams,
  BlockedUser,
  getAuthenticatedGithubClient,
} from './shared.js';
import {Octokit} from '@octokit/rest';
import {DocumentSnapshot} from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';

/** Unblocks the provided user from Github, clearing their records from our listing. */
export const unblockUser = functions.https.onCall<UnblockUserParams>(
  {
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  },
  async (request) => {
    const {username} = request.data;
    await checkAuthenticationAndAccess(request);
    /** The authenticated Github client for performing actions. */
    const github = await getAuthenticatedGithubClient();
    /** The Firestore record of the user to be unblocked */
    const doc = await blockedUsersCollection().doc(username).get();

    await performUnblock(github, doc);
  },
);

/** Unblocks the all listed users who's block has expired, runs daily. */
export const dailyUnblock = functions.scheduler.onSchedule(
  {
    schedule: 'every day 08:00',
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    /** The authenticated Github client for performing actions. */
    const github = await getAuthenticatedGithubClient();
    /** The Firestore records for all users who's block has expired. */
    const usersToUnblock = await blockedUsersCollection()
      .where('blockUntil', '<', new Date())
      .get();

    const results = await Promise.allSettled(
      usersToUnblock.docs.map((user) => performUnblock(github, user)),
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        functions.logger.error('Failed to unblock user:', result.reason);
      }
    }
  },
);

async function performUnblock(github: Octokit, doc: DocumentSnapshot<BlockedUser>): Promise<void> {
  const data = doc.data();
  if (!data) {
    throw new Error(`No blocked user record found for document "${doc.id}".`);
  }
  await github.orgs.unblockUser({org: 'angular', username: data.username});
  await doc.ref.delete();
}
