import {Injectable} from '@angular/core';
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  linkWithPopup,
  signInWithPopup,
  unlink,
  User,
  UserInfo,
} from '@angular/fire/auth';
import {Subject} from 'rxjs';

const DEFAULT_AVATAR_URL = 'https://lh3.googleusercontent.com/a/default-user=s64-c';

@Injectable()
export class AccountService {
  loggedInStateChange = new Subject<void>();

  /** Whether a user is logged in currently. */
  isLoggedIn!: boolean;

  /** The Github account information for the current user, if a user is logged in and has linked their Github account. */
  githubInfo!: UserInfo | null;

  /** The Google account information for the current user, if a user is logged in. */
  googleInfo!: UserInfo | null;

  avatarUrl = DEFAULT_AVATAR_URL;
  displayName: string | undefined;

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      this.avatarUrl = user?.photoURL || DEFAULT_AVATAR_URL;
      this.githubInfo = getInfoForProvider(user, 'github.com');
      this.googleInfo = getInfoForProvider(user, 'google.com');
      this.isLoggedIn = user !== null;
      this.loggedInStateChange.next();
    });
  }

  /** Sign the user out of the application. */
  async signOut() {
    await this.auth.signOut();
  }

  /** Sign the user into the application using a Google account.. */
  async signInWithGoogle() {
    return !!(await signInWithPopup(this.auth, new GoogleAuthProvider()));
  }

  /** If a user is currently logged in, link a Github account to the user's account. */
  async linkWithGithub() {
    if (this.auth.currentUser === null) {
      throw Error();
    }
    return !!(await linkWithPopup(this.auth.currentUser, new GithubAuthProvider()));
  }

  /**
   * If a user is currently logged in and has a github account linked, unlink
   * the Github account from the user's account.
   */
  async unlinkFromGithub() {
    if (
      this.auth.currentUser === null ||
      getInfoForProvider(this.auth.currentUser, 'github.com') === null
    ) {
      throw Error();
    }
    return await unlink(this.auth.currentUser!, GithubAuthProvider.PROVIDER_ID);
  }
}

/** Get the provider specific UserInfo object for a given User. */
function getInfoForProvider(user: User | null, provider: 'github.com' | 'google.com') {
  if (user === null) {
    return null;
  }
  return user.providerData.find((data) => data.providerId === provider) || null;
}
