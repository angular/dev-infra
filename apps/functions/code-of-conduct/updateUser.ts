import * as functions from 'firebase-functions';
import {checkAuthenticationAndAccess, blockedUsersCollection, BlockedUser} from './shared.js';

export interface UpdateUserParams {
  username: string;
  data: {
    blockUntil?: string | false;
    comments?: string;
  };
}

/** Updates the metadata for a blocked user. */
export const updateUser = functions.https.onCall<UpdateUserParams>(
  {
    secrets: ['ANGULAR_ROBOT_APP_PRIVATE_KEY', 'ANGULAR_ROBOT_APP_ID'],
  },
  async (request) => {
    const {username, data} = request.data;

    // Ensure that the request was authenticated and authorized.
    await checkAuthenticationAndAccess(request);

    const userDoc = await blockedUsersCollection().doc(username).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', `The entry for ${username} does not exist`);
    }

    const updateData: Partial<BlockedUser> = {};
    if (data.comments !== undefined) {
      updateData.comments = data.comments;
    }
    if (data.blockUntil !== undefined) {
      // Support date string conversion
      updateData.blockUntil = data.blockUntil === false ? false : new Date(data.blockUntil);
    }

    await userDoc.ref.update(updateData);
  },
);
