import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

// TODO(devversion): Remove this when Angular Fire is using APF v13+
import type * as authTypes from '@angular/fire/auth/angular-fire-auth.js';
import type {Auth, UserInfo, User} from '@angular/fire/auth/angular-fire-auth.js';

const {GithubAuthProvider, GoogleAuthProvider, linkWithPopup, signInWithPopup, unlink} =
  (await import('@angular/fire/auth' as any)) as typeof authTypes;

const DEFAULT_AVATAR_URL = 'https://lh3.googleusercontent.com/a/default-user=s64-c';

@Injectable()
export class AccountService {
  /** When the logged in state of the user changes. */
  loggedInStateChange = new Subject<void>();
  /** Whether a user is logged in currently. */
  isLoggedIn: boolean = false;
  /** The Github account information for the current user, if a user is logged in and has linked their Github account. */
  githubInfo: UserInfo | null = null;
  /** The Google account information for the current user, if a user is logged in. */
  googleInfo: UserInfo | null = null;
  /** The URL for the avatar of the user if available. */
  avatarUrl = DEFAULT_AVATAR_URL;
  /** The display name for the user is available. */
  displayName: string | undefined;
  /** The current accounts github token, if available. */
  private githubToken: string | null = null;

  constructor(private auth: Auth) {
    this.auth.onIdTokenChanged((user) => {
      if (user === null) {
        this.githubToken = null;
      } else {
        user.getIdTokenResult().then((value) => {
          this.githubToken = (value.claims.githubToken as string) || null;
        });
      }

      this.avatarUrl = user?.photoURL || DEFAULT_AVATAR_URL;
      this.githubInfo = getInfoForProvider(user, 'github.com');
      this.googleInfo = getInfoForProvider(user, 'google.com');
      this.isLoggedIn = user !== null;
      this.displayName = user?.displayName || undefined;
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
