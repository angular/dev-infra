import * as admin from 'firebase-admin';
import {Octokit} from '@octokit/rest';
import {createAppAuth} from '@octokit/auth-app';
import * as functions from 'firebase-functions';

/** Parameters for blocking a user. */
export interface BlockUserParams {
  username: string;
  blockUntil: string | false;
  context: string;
  comments: string;
}

/** Parameters for unblocking a user. */
export interface UnblockUserParams {
  username: string;
}

/**
 * Convertor to ensure the data types for javascript and firestore storage are in sync.
 */
export const converter: admin.firestore.FirestoreDataConverter<BlockedUser> = {
  toFirestore: (user: BlockedUser) => {
    return user;
  },
  fromFirestore: (data: admin.firestore.QueryDocumentSnapshot<BlockedUser>) => {
    return {
      username: data.get('username'),
      context: data.get('context'),
      comments: data.get('comments'),
      blockedBy: data.get('blockedBy'),
      blockedOn: new Date(data.get('blockedOn').seconds * 1000),
      blockUntil:
        data.get('blockUntil') == false ? false : new Date(data.get('blockUntil').seconds * 1000),
    };
  },
};

/** Get the firestore collection for the blocked users, with the converter already set up. */
export const blockedUsersCollection = () =>
  admin.firestore().collection('blockedUsers').withConverter(converter);

/** A blocked user stored in Firestore. */
export interface BlockedUser extends admin.firestore.DocumentData {
  blockedBy: string;
  blockedOn: Date;
  username: string;
  blockUntil: Date | false;
  context: string;
  comments: string;
}

/** A CallableContext which is confirmed to already have an authorized user. */
interface AuthenticatedCallableContext extends functions.https.CallableRequest {
  auth: NonNullable<functions.https.CallableRequest['auth']>;
}

/** Verify that the incoming request is authenticated and authorized for access. */
export async function checkAuthenticationAndAccess(
  context: functions.https.CallableRequest,
): Promise<AuthenticatedCallableContext> {
  // Authentication is managed by firebase as this occurs within the Firebase functions context.
  // If the user is unauthenticted, the authorization object will be undefined.
  if (context.auth == undefined) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError('unauthenticated', 'This action requires authentication');
  }

  const user = await admin.auth().getUser(context.auth.uid);
  const githubProvider = user.providerData.find((data) => data.providerId === 'github.com');

  if (!githubProvider) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You must link your Github account to use this application.',
    );
  }

  const github = await getAuthenticatedGithubClient();

  try {
    // Resolve the github username from the connected UID
    const {data: githubUser} = await github.request('GET /user/{user_id}', {
      user_id: githubProvider.uid,
    });

    await github.orgs.checkMembershipForUser({
      org: 'angular',
      username: githubUser.login,
    });
  } catch (err: any) {
    if (err.status === 404) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You must be a member of the Angular Github organization.',
      );
    }
    throw err;
  }

  return context as AuthenticatedCallableContext;
}

/** Retrieves a Github client instance authenticated as the Angular Robot Github App. */
export async function getAuthenticatedGithubClient(): Promise<Octokit> {
  const GITHUB_APP_PEM = Buffer.from(
    process.env['ANGULAR_ROBOT_APP_PRIVATE_KEY']!,
    'base64',
  ).toString('utf-8');

  const applicationGithub = new Octokit({
    authStrategy: createAppAuth,
    auth: {appId: process.env['ANGULAR_ROBOT_APP_ID']!, privateKey: GITHUB_APP_PEM},
  });
  /** The specific installation id for the provided repository. */
  const {id: installation_id} = (await applicationGithub.apps.getOrgInstallation({org: 'angular'}))
    .data;
  /** A temporary github access token. */
  const {token} = (
    await applicationGithub.rest.apps.createInstallationAccessToken({installation_id})
  ).data;

  return new Octokit({auth: token});
}
