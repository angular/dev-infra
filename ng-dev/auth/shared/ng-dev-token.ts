import {getFunctions, httpsCallable, HttpsCallableResult} from 'firebase/functions';
import {getAuth} from 'firebase/auth';
import {mkdir, readFile, stat, writeFile} from 'fs/promises';
import {homedir} from 'os';
import {join} from 'path';
import {Log} from '../../utils/logging.js';
import {randomBytes, createCipheriv, createDecipheriv, createHash} from 'crypto';

/** Algorithm to use for encryption. */
const algorithm = 'aes-256-ctr';

/** Encryption key for encrypting the token. */
const ENCRYPTION_KEY = createHash('sha256')
  .update(Buffer.from('Angular'))
  .digest('hex')
  .substring(0, 32);

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
async function invokeServerFunctionUnsafe<P extends {}, R>(
  name: string,
  params: P,
): Promise<HttpsCallableResult<R>> {
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
  ngDevToken = {token, email: auth.currentUser.email || 'unknown email'};
  await saveTokenToFileSystem(ngDevToken);
}

/**
 * Check the validity of the local ng-dev token with the server, if a local token is present. If a
 * valid token is present, restores it to the current ngDevToken in memory.
 */
export async function restoreNgTokenFromDiskIfValid() {
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
  await writeFile(tokenPath, encrypt(JSON.stringify(data)));
}

/** Retrieve the token from the file system. */
async function retrieveTokenFromFileSystem(): Promise<NgDevToken | null> {
  if (!(await stat(tokenPath))) {
    return null;
  }

  const rawToken = Buffer.from(await readFile(tokenPath)).toString();
  return JSON.parse(decrypt(rawToken)) as NgDevToken;
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
