/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig, GithubConfig} from '../config.js';
import {findOwnedForksOfRepoQuery} from './graphql-queries.js';
import {yellow} from '../logging.js';

import {GitClient} from './git-client.js';
import {AuthenticatedGithubClient, GithubRepo} from './github.js';
import {
  getRepositoryGitUrl,
  GITHUB_TOKEN_GENERATE_URL,
  GITHUB_TOKEN_SETTINGS_URL,
} from './github-urls.js';

/** Describes a function that can be used to test for given Github OAuth scopes. */
export type OAuthScopeTestFunction = (scopes: string[], missing: string[]) => void;

/**
 * Extension of the `GitClient` with additional utilities which are useful for
 * authenticated Git client instances.
 */
export class AuthenticatedGitClient extends GitClient {
  /**
   * Regular expression that matches the provided Github token. Used for
   * sanitizing the token from Git child process output.
   */
  private readonly _githubTokenRegex: RegExp = new RegExp(this.githubToken, 'g');

  /** The OAuth scopes available for the provided Github token. */
  private _cachedOauthScopes: Promise<string[]> | null = null;

  /** Cached fork repositories of the authenticated user. */
  private _cachedForkRepositories: GithubRepo[] | null = null;

  /** Instance of an authenticated github client. */
  override readonly github = new AuthenticatedGithubClient(this.githubToken);

  protected constructor(
    readonly githubToken: string,
    config: {github: GithubConfig},
    baseDir?: string,
  ) {
    super(config, baseDir);
  }

  /** Sanitizes a given message by omitting the provided Github token if present. */
  override sanitizeConsoleOutput(value: string): string {
    return value.replace(this._githubTokenRegex, '<TOKEN>');
  }

  /** Git URL that resolves to the configured repository. */
  override getRepoGitUrl() {
    return getRepositoryGitUrl(this.remoteConfig, this.githubToken);
  }

  /**
   * Assert the GitClient instance is using a token with permissions for the all of the
   * provided OAuth scopes.
   */
  async hasOauthScopes(testFn: OAuthScopeTestFunction): Promise<true | {error: string}> {
    const scopes = await this._fetchAuthScopesForToken();
    const missingScopes: string[] = [];
    // Test Github OAuth scopes and collect missing ones.
    testFn(scopes, missingScopes);
    // If no missing scopes are found, return true to indicate all OAuth Scopes are available.
    if (missingScopes.length === 0) {
      return true;
    }

    // Pre-constructed error message to log to the user, providing missing scopes and
    // remediation instructions.
    const error =
      `The provided <TOKEN> does not have required permissions due to missing scope(s): ` +
      `${yellow(missingScopes.join(', '))}\n\n` +
      `Update the token in use at:\n` +
      `  ${GITHUB_TOKEN_SETTINGS_URL}\n\n` +
      `Alternatively, a new token can be created at: ${GITHUB_TOKEN_GENERATE_URL}\n`;

    return {error};
  }

  /** Gets an owned fork for the configured project of the authenticated user. */
  async getForkOfAuthenticatedUser(): Promise<GithubRepo> {
    const forks = await this.getAllForksOfAuthenticatedUser();

    if (forks.length === 0) {
      throw Error('Unable to find fork a for currently authenticated user.');
    }

    return forks[0];
  }

  /**
   * Finds all forks owned by the currently authenticated user in the Git client,
   *
   * The determined fork repositories are cached as we assume that the authenticated
   * user will not change during execution, or that no new forks are created.
   */
  async getAllForksOfAuthenticatedUser(): Promise<GithubRepo[]> {
    if (this._cachedForkRepositories !== null) {
      return this._cachedForkRepositories;
    }

    const {owner, name} = this.remoteConfig;
    const result = await this.github.graphql(findOwnedForksOfRepoQuery, {owner, name});

    return (this._cachedForkRepositories = result.repository.forks.nodes.map((node) => ({
      owner: node.owner.login,
      name: node.name,
    })));
  }

  /** Fetch the OAuth scopes for the loaded Github token. */
  private _fetchAuthScopesForToken() {
    // If the OAuth scopes have already been loaded, return the Promise containing them.
    if (this._cachedOauthScopes !== null) {
      return this._cachedOauthScopes;
    }
    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
    // usage of a request against that rate_limit for this lookup.
    return (this._cachedOauthScopes = this.github.rateLimit.get().then((response) => {
      const scopes = response.headers['x-oauth-scopes'];

      // If no token is provided, or if the Github client is authenticated incorrectly,
      // the `x-oauth-scopes` response header is not set. We error in such cases as it
      // signifies a faulty  of the
      if (scopes === undefined) {
        throw Error('Unable to retrieve OAuth scopes for token provided to Git client.');
      }

      return scopes
        .split(',')
        .map((scope) => scope.trim())
        .filter((scope) => scope !== '');
    }));
  }

  /** The previously configured access token. */
  private static _token: string | null = null;
  /** The singleton instance of the `AuthenticatedGitClient`. */
  private static _authenticatedInstance: Promise<AuthenticatedGitClient> | null = null;

  /**
   * Static method to get the singleton instance of the `AuthenticatedGitClient`,
   * creating it if it has not yet been created.
   */
  static override async get(): Promise<AuthenticatedGitClient> {
    if (AuthenticatedGitClient._token === null) {
      throw new Error('No instance of `AuthenticatedGitClient` has been configured.');
    }

    // If there is no cached authenticated instance, create one and cache the promise
    // immediately. This avoids constructing a client twice accidentally when e.g. waiting
    // for the configuration to be loaded.
    if (AuthenticatedGitClient._authenticatedInstance === null) {
      AuthenticatedGitClient._authenticatedInstance = (async (token: string) => {
        return new AuthenticatedGitClient(token, await getConfig([assertValidGithubConfig]));
      })(AuthenticatedGitClient._token);
    }

    return AuthenticatedGitClient._authenticatedInstance;
  }

  /** Configures an authenticated git client. */
  static configure(token: string): void {
    if (AuthenticatedGitClient._authenticatedInstance) {
      throw Error(
        'Unable to configure `AuthenticatedGitClient` as it has been configured already.',
      );
    }

    AuthenticatedGitClient._token = token;
  }
}
