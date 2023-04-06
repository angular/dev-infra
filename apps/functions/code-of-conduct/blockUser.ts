import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
  checkAuthenticationAndAccess,
  BlockUserParams,
  blockedUsersCollection,
  getAuthenticatedGithubClient,
} from './shared.js';
import {RequestError} from '@octokit/request-error';

export const blockUser = functions
  .runWith({
    secrets: ['GITHUB_PEM', 'GITHUB_APP_ID'],
  })
  .https.onCall(async ({comments, blockUntil, context, username}: BlockUserParams, request) => {
    // Ensure that the request was authenticated.
    checkAuthenticationAndAccess(request);

    /** The Github client for performing Github actions. */
    const github = await getAuthenticatedGithubClient();
    /** The user performing the block action */
    const actor = await admin.auth().getUser(request.auth.uid);
    /** The display name of the user. */
    const actorName = actor.displayName || actor.email || 'Unknown User';
    /** The Firestore Document for the user being blocked. */
    const userDoc = await blockedUsersCollection().doc(username).get();

    if (userDoc.exists) {
      throw Error();
    }

    await github.orgs.blockUser({org: 'angular', username: username}).catch((err: RequestError) => {
      // If a user is already blocked, we can continue silently failing as action still "succeeded".
      if (err.message === 'Blocked user has already been blocked' && err.status === 422) {
        return;
      }
      throw err;
    });

    await userDoc.ref.create({
      comments: comments,
      context: context,
      username: username,
      blockedBy: actorName,
      blockedOn: new Date(),
      blockUntil: new Date(blockUntil),
    });
  });
