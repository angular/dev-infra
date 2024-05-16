import {
  Auth,
  https,
  UserRecord,
  UserEventUpdateRequest,
  AuthEventContext,
} from 'gcip-cloud-functions';

/** Validate accounts before sign in using google cloud before sigin in syncronous function. */

export const beforeSignIn = new Auth()
  .functions()
  .beforeSignInHandler(
    async (user: UserRecord, context: AuthEventContext): Promise<UserEventUpdateRequest> => {
      /** The UserEventUpdate to save based on the signin results. */
      const event: UserEventUpdateRequest = {};

      // If a user is able to reach this without a login credential being present, throw an auth error.
      // Note: This should not be possible, but it doesn't hurt to have this check in place.
      if (context.credential === undefined) {
        throw new https.HttpsError(
          'unauthenticated',
          `Cannot sign in as '${user.email}' without credential.`,
        );
      }

      // When users sign in with github, we save the access token as a claim on the user object.
      if (context.credential.providerId === 'github.com') {
        event.customClaims = {...event.customClaims, githubToken: context.credential.accessToken};
      }

      return event;
    },
  );
