import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {CallableContext} from 'firebase-functions/lib/providers/https';

/**
 * Request a short lived ng-dev token.  If granted, we rely on session cookies as this token.  The token
 */
export const ngDevTokenRequest = functions.https.onCall(
  async ({idToken}: {idToken: string}, context: CallableContext) => {
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Requesting an ngDevToken requires being authenticated first.',
      );
    }
    /** Twenty hours in ms. */
    const twentyHours = 1000 * 60 * 60 * 20;

    return await admin.auth().createSessionCookie(idToken, {expiresIn: twentyHours});
  },
);

/**
 * Validate the provided token is still valid.
 */
export const ngDevTokenValidate = functions.https.onCall(validateToken);

/**
 * Revokes the all tokens for the user of the provided token.
 */
export const ngDevRevokeToken = functions.https.onCall(async ({token}: {token: string}) => {
  await admin
    .auth()
    .verifySessionCookie(token)
    .then((claims: admin.auth.DecodedIdToken) => {
      return admin.auth().revokeRefreshTokens(claims.uid);
    });
});

/**
 * Verify a ng-dev token is still valid.
 */
async function validateToken({token}: {token: string}) {
  return !!(token && (await admin.auth().verifySessionCookie(token, true)));
}
