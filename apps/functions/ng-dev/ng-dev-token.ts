import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
/**
 * Request a short lived ng-dev token. If granted, we rely on session cookies as this token. The token
 * is to be used for all requests to the ng-dev service.
 */
export const ngDevTokenRequest = functions.https.onCall<{idToken: string}>(
  async (request: functions.https.CallableRequest) => {
    const {idToken} = request.data;
    if (!request.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Requesting an ng-dev token requires authentication',
      );
    }
    const {auth_time} = await admin.auth().verifyIdToken(idToken, /* checkRevoked */ true);

    // Only allow creation if the user signed in the last minute. We use one minute, as this
    // token should be immediately requested upon login, rather than using a long lived session.
    if (new Date().getTime() / 1000 - auth_time > 1 * 60) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'ng-dev tokens must be requested within one minute of verifying login',
      );
    }

    return admin.auth().createSessionCookie(idToken, {expiresIn: /* 20 Hours in ms */ 72000000});
  },
);

/**
 * Validate the provided token is still valid.
 */
export const ngDevTokenValidate = functions.https.onCall<{token: string}>(async (request) => {
  return await validateToken(request.data);
});

/**
 * Revokes the all tokens for the user of the provided token.
 */
export const ngDevRevokeToken = functions.https.onCall<{token: string}>(async (request) => {
  const {token} = request.data;
  await admin
    .auth()
    .verifySessionCookie(token)
    .then((decodedToken: admin.auth.DecodedIdToken) => {
      return admin.auth().revokeRefreshTokens(decodedToken.uid);
    });
});

/**
 * Verify a ng-dev token is still valid.
 */
async function validateToken({token}: {token: string}) {
  return !!(token && (await admin.auth().verifySessionCookie(token, /* checkRevoked */ true)));
}
