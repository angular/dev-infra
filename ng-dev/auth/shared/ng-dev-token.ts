import {getFunctions, httpsCallable} from 'firebase/functions';
import {getAuth} from 'firebase/auth';
import {mkdir, readFile, stat, writeFile} from 'fs/promises';
import {homedir} from 'os';
import {join} from 'path';
import {Log} from '../../utils/logging.js';

/** Data for an ng-dev token. */
interface NgDevToken {
  token: string;
  email: string;
}

/** The directory the token is stored in. */
const tokenDir = join(homedir(), '.ng-dev');
/** The full path to the token file. */
const tokenPath = join(tokenDir, '.ng-dev-token');
/** The current token data, or null if no token is known. */
let ngDevToken: NgDevToken | null = null;

/**
 * Setup and invoke a firebase function on the server, unsafe as the authentication is not
 * automatically included in the invocation.
 */
async function invokeServerFunctionUnsafe<P extends {}, R>(name: string, params: P) {
  const func = httpsCallable<P, R>(getFunctions(), name);
  return await func(params);
}

/**
 * Setup and invoke a firebase function on the server after confirming a ng-dev token is present.
 */
export function invokeServerFunction<P extends {}, R>(name: string, params: P = {} as P) {
  if (ngDevToken === null) {
    throw Error(`Cannot invoke ${name} prior to a user logging in, please run "ng-dev auth login"`);
  }
  return invokeServerFunctionUnsafe<P, R>(name, {...params, token: ngDevToken.token});
}

/**
 * Request a new ng-dev token from the server, storing it the file system for use.
 */
export async function requestNgDevToken() {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw Error('Cannot request credential service token if no user is logged in.');
  }

  const {data: token} = await invokeServerFunctionUnsafe<{}, string>('ngDevTokenRequest', {
    idToken: await auth.currentUser.getIdToken(),
  });
  await saveTokenToFileSystem({token, email: auth.currentUser.email || 'unknown email'});
}

/**
 * Check the validity of the local ng-dev token with the server.
 */
export async function checkNgDevTokenState() {
  try {
    const data = await retrieveTokenFromFileSystem();
    if (data === null) {
      throw Error('No user currently logged in');
    }
    if (await invokeServerFunctionUnsafe<NgDevToken, boolean>('ngDevTokenValidate', data)) {
      ngDevToken = data;
    }
  } catch (e) {
    Log.debug('Unable to restore credentials:');
    Log.debug(e);
  }
}

/** Get the current user for the ng-dev token. */
export async function getCurrentUser() {
  if (ngDevToken === null) {
    return false;
  }
  return ngDevToken.email;
}

/** Save the token to the file system as a base64 encoded string. */
async function saveTokenToFileSystem(data: NgDevToken) {
  await mkdir(tokenDir, {recursive: true});
  await writeFile(tokenPath, Buffer.from(JSON.stringify(data), 'utf8').toString('base64'));
  ngDevToken = data;
}

/** Retrieve the token from the file system. */
async function retrieveTokenFromFileSystem(): Promise<NgDevToken | null> {
  if (await stat(tokenPath)) {
    return null;
  }

  const rawToken = Buffer.from(await readFile(tokenPath, 'utf8'), 'base64').toString('utf8');
  return JSON.parse(rawToken) as NgDevToken;
}
