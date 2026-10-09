import {error, getInput, info, setSecret} from '@actions/core';
import {Octokit} from '@octokit/rest';
import {createAppAuth} from '@octokit/auth-app';
import {context} from '@actions/github';

import {RestEndpointMethodTypes} from '@octokit/rest';

export type GithubAppMetadata = [appId: number, inputKey: string];

/** Angular Lock Bot Github app (angular-lock-bot). */
export const ANGULAR_LOCK_BOT: GithubAppMetadata = [40213, 'lock-bot-key'];
/** Angular Robot Github app (angular-robot). */
export const ANGULAR_ROBOT: GithubAppMetadata = [43341, 'angular-robot-key'];

/** Create a JWT authenticated App client to manage installation tokens. */
async function getJwtAuthedAppClient([appId, inputKey]: GithubAppMetadata): Promise<Octokit> {
  /** The private key for the angular robot app. */
  const privateKey = getInput(inputKey, {required: true});

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {appId, privateKey},
  });
}

// Local types for Org and Repo to make the typings in getAuthTokenFor more readable.
type Org = {org: string};
type Repo = {repo: string; owner: string};

/** Options for configuring the installation auth token retrieval. */
export interface GetAuthTokenOptions {
  /** Explicit list of repositories to scope the token to. If omitted, defaults to [repo.repo] when repo context exists. */
  repositories?: string[];
  /** Whether the minted token should have org-wide access across all installation repositories. */
  orgWide?: boolean;
}

/** Type guard to determine if a target is an Org. */
export function isOrg(target: unknown): target is Org {
  return typeof target === 'object' && target !== null && typeof (target as Org).org === 'string';
}

/** Type guard to determine if a target is a Repo. */
export function isRepo(target: unknown): target is Repo {
  return (
    typeof target === 'object' &&
    target !== null &&
    typeof (target as Repo).repo === 'string' &&
    typeof (target as Repo).owner === 'string'
  );
}

/**
 * Retrieves an installation auth token for the provided app.
 *
 * Using our own robot account is preferable as it makes it immediately apparent in context of an
 * issue/pr event that this was performed by the Angular team. Additionally, this allows for us to
 * have another layer of ability to manage access as the Angular app needs to obtain permission to
 * act on a repository, unlike the github-actions robot account which implicitly has access based on
 * where it was executed from.
 */
export async function getAuthTokenFor(
  app: GithubAppMetadata,
  org: Org,
  options?: GetAuthTokenOptions,
): Promise<string>;
export async function getAuthTokenFor(
  app: GithubAppMetadata,
  repo: Repo,
  options?: GetAuthTokenOptions,
): Promise<string>;
export async function getAuthTokenFor(
  app: GithubAppMetadata,
  options?: GetAuthTokenOptions,
): Promise<string>;
export async function getAuthTokenFor(
  app: GithubAppMetadata,
  orgOrRepoOrOptions: Org | Repo | GetAuthTokenOptions = context.repo,
  options: GetAuthTokenOptions = {},
): Promise<string> {
  let target: Org | Repo;
  let opts: GetAuthTokenOptions;

  if (isOrg(orgOrRepoOrOptions)) {
    target = orgOrRepoOrOptions;
    opts = options;
  } else if (isRepo(orgOrRepoOrOptions)) {
    target = orgOrRepoOrOptions;
    opts = options;
  } else {
    target = context.repo;
    opts = (orgOrRepoOrOptions as GetAuthTokenOptions) ?? {};
  }

  const github = await utils.getJwtAuthedAppClient(app);
  let id: number;

  if (isOrg(target)) {
    id = (await github.apps.getOrgInstallation({...target})).data.id;
  } else {
    id = (await github.apps.getRepoInstallation({...target})).data.id;
  }

  const requestParams: RestEndpointMethodTypes['apps']['createInstallationAccessToken']['parameters'] =
    {
      installation_id: id,
    };

  if (!opts.orgWide) {
    if (opts.repositories && opts.repositories.length > 0) {
      requestParams.repositories = opts.repositories;
    } else if (isRepo(target)) {
      requestParams.repositories = [target.repo];
    }
  }

  const {token} = (await github.rest.apps.createInstallationAccessToken(requestParams)).data;

  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('GitHub API did not return a valid installation access token.');
  }

  setSecret(token);

  return token;
}

/** Revoke the currently-authenticated installation token for the Octokit instance. */
export async function revokeActiveInstallationToken(octokitInstallation: Octokit): Promise<void>;
/** Revoke the specified installation token. */
export async function revokeActiveInstallationToken(installationToken: string): Promise<void>;
export async function revokeActiveInstallationToken(
  githubOrToken: Octokit | string,
): Promise<void> {
  if (typeof githubOrToken === 'string') {
    await new Octokit({auth: githubOrToken, request: {fetch}}).apps.revokeInstallationAccessToken();
  } else {
    await githubOrToken.apps.revokeInstallationAccessToken();
  }
  info('Revoked installation token used for Angular Robot.');
}

/** Set of membership lookup results, used as cache for lookups. */
const isGooglerOrgMemberCache = new Map<string, boolean>();

/**
 * Checks whether the given user is a member of the googlers organization.
 */
export async function isGooglerOrgMember(username: string, client: Octokit): Promise<boolean> {
  if (isGooglerOrgMemberCache.has(username)) {
    return isGooglerOrgMemberCache.get(username)!;
  }

  try {
    const isMember = await client.orgs.checkMembershipForUser({org: 'googlers', username}).then(
      ({status}) => (status as number) === 204,
      () => false,
    );
    isGooglerOrgMemberCache.set(username, isMember);
    return isMember;
  } catch (e) {
    error(`Could not check googlers org membership for ${username}: ${e}`);
    return false;
  }
}

export const utils = {
  getJwtAuthedAppClient,
  getAuthTokenFor,
  revokeActiveInstallationToken,
  isGooglerOrgMember,
};
