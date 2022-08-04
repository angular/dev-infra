import {getFunctions, httpsCallable, HttpsCallableResult} from 'firebase/functions';
import {getAuth} from 'firebase/auth';
import {mkdir, readFile, stat, writeFile} from 'fs/promises';
import {homedir} from 'os';
import {join} from 'path';
import {randomBytes, createCipheriv, createDecipheriv, createHash} from 'crypto';
import {RawData, WebSocket} from 'ws';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {assertValidGithubConfig, getConfig} from '../../utils/config.js';
import {getApp, initializeApp} from 'firebase/app';

/** Algorithm to use for encryption. */
const algorithm = 'aes-256-ctr';

/** Encryption key for encrypting the token. */
const ENCRYPTION_KEY = createHash('sha256')
  .update(Buffer.from('Angular'))
  .digest('hex')
  .substring(0, 32);

/** Data for the user of an ng-dev token. */
interface NgDevUser {
  email: string;
}

/** Data for the user of an ng-dev token, including the raw token. */
interface NgDevUserWithToken extends NgDevUser {
  token: string;
}

/** Configuration for the firebase application used for ng-dev token management. */
const firebaseConfig = {
  apiKey: 'AIzaSyDM3rXWUgYuxYCmBKwnZvvnraYoYIE5_5U',
  authDomain: 'internal-200822.firebaseapp.com',
  projectId: 'internal-200822',
  storageBucket: 'internal-200822.appspot.com',
  messagingSenderId: '823469418460',
  appId: '1:823469418460:web:009b51c93132b218761119',
};

/** The directory the token is stored in. */
const tokenDir = join(homedir(), '.ng-dev');
/** The full path to the token file. */
const tokenPath = join(tokenDir, '.ng-dev-token');
/** The current token data, or null if no token is known. */
let ngDevUserToken: NgDevUserWithToken | null = null;

/**
 * Setup and invoke a firebase function on the server, unsafe as the authentication is not
 * automatically included in the invocation.
 */
async function invokeServerFunctionUnsafe<P extends {}, R>(
  name: string,
  params: P,
): Promise<HttpsCallableResult<R>> {
  // Always confirm the application has been initialized before invoking a function.
  try {
    getApp();
  } catch {
    initializeApp(firebaseConfig);
  }
  const func = httpsCallable<P, R>(getFunctions(), name);
  return await func(params);
}

/**
 * Setup and invoke a firebase function on the server after confirming a ng-dev token is present.
 */
export function invokeServerFunction<P extends {}, R>(
  name: string,
  params: P = {} as P,
): Promise<HttpsCallableResult<R>> {
  if (ngDevUserToken === null) {
    throw Error(`Cannot invoke ${name} prior to a user logging in, please run "ng-dev auth login"`);
  }
  return invokeServerFunctionUnsafe<P, R>(name, {...params, token: ngDevUserToken.token});
}

/**
 * Request a new ng-dev token from the server, storing it the file system for use.
 */
export async function requestNgDevToken(): Promise<NgDevUser> {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw Error('Cannot request credential service token if no user is logged in.');
  }

  const {data: token} = await invokeServerFunctionUnsafe<{}, string>('ngDevTokenRequest', {
    idToken: await auth.currentUser.getIdToken(),
  });
  ngDevUserToken = {token, email: auth.currentUser.email || 'unknown email'};
  await saveTokenToFileSystem(ngDevUserToken);
  return getUserWithoutToken(ngDevUserToken);
}

/**
 * Check the validity of the local ng-dev token with the server, if a local token is present. If a
 * valid token is present, restores it to the current ngDevToken in memory.
 */
export async function restoreNgTokenFromDiskIfValid() {
  const data = await retrieveTokenFromFileSystem();
  if (data === null) {
    return;
  }
  await invokeServerFunctionUnsafe<NgDevUser, boolean>('ngDevTokenValidate', data).then(
    () => (ngDevUserToken = data),
    () => {},
  );
}

/** Get the current user for the ng-dev token, if defined. */
export async function getCurrentUser() {
  if (ngDevUserToken === null) {
    return null;
  }
  return getUserWithoutToken(ngDevUserToken);
}

/** Save the token to the file system as a base64 encoded string. */
async function saveTokenToFileSystem(data: NgDevUserWithToken) {
  await mkdir(tokenDir, {recursive: true});
  await writeFile(tokenPath, encrypt(JSON.stringify(data)));
}

/** Retrieve the token from the file system. */
async function retrieveTokenFromFileSystem(): Promise<NgDevUserWithToken | null> {
  if (!(await stat(tokenPath))) {
    return null;
  }

  const rawToken = Buffer.from(await readFile(tokenPath)).toString();
  return JSON.parse(decrypt(rawToken)) as NgDevUserWithToken;
}

/** Encrypt the provided string. */
function encrypt(text: string) {
  const iv = randomBytes(16);
  let cipher = createCipheriv(algorithm, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/** Decrypt the provided string. */
function decrypt(text: string) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift()!, 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

/**
 * Configure the AuthorizedGitClient using a temporary token from the ng-dev credential service.
 * The token is valid for the life of the socket being open, which is expected to be for the life
 * of the command running.
 */
export function configureAuthorizedGitClientWithTemporaryToken() {
  return new Promise<void>(async (resolve, reject) => {
    await restoreNgTokenFromDiskIfValid();
    if (ngDevUserToken === null) {
      return reject(new Error('Cannot run the command without first logging into ng-dev'));
    }

    try {
      /** The ng-dev configuration for the repoistory. */
      const config = await getConfig([assertValidGithubConfig]);
      /** The name and owner of the repository. */
      const {name, owner} = config.github;

      /** Websocket to retrieve a temporary access token for the repository. */
      const socket = new WebSocket('wss://credential-service-52wwmb4y3q-uc.a.run.app', {
        headers: {
          authorization: `Bearer ${ngDevUserToken.token}`,
          ng_repo_name: name,
          ng_repo_owner: owner,
        },
      });

      // When the token is provided via the websocket message, use the token to set up
      // the AuthenticatedGitClient
      socket.on('message', (msg: RawData) => {
        AuthenticatedGitClient.configure(msg.toString('utf8'), 'bot');
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Get the NgDevUser (without the token) from the NgDevUserWithToken. */
function getUserWithoutToken(user: NgDevUserWithToken): NgDevUser {
  const token: Partial<NgDevUserWithToken> = {...user};
  delete token.token;
  return token as NgDevUser;
}
