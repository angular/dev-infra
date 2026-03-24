import * as functions from 'firebase-functions';
import {checkAuthenticationAndAccess, blockedUsersCollection} from './shared.js';

/** Returns a list of all blocked users. */
export const getBlockedUsers = functions.https.onCall<void>(
  {
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  },
  async (request) => {
    // Ensure that the request was authenticated and authorized.
    await checkAuthenticationAndAccess(request);

    const snapshot = await blockedUsersCollection().get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        blockUntil: data.blockUntil instanceof Date ? data.blockUntil.getTime() : data.blockUntil,
        blockedOn: data.blockedOn instanceof Date ? data.blockedOn.getTime() : data.blockedOn,
      };
    });
  },
);
