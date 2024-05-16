import {getInput, info} from '@actions/core';
import {Octokit} from '@octokit/rest';
import {createAppAuth} from '@octokit/auth-app';
import {context} from '@actions/github';

export type GithubAppMetadata = [appId: number, inputKey: string];

/** Angular Lock Bot Github app (angular-lock-bot). */
export const ANGULAR_LOCK_BOT: GithubAppMetadata = [40213, 'lock-bot-key'];
/** Angular Robot Github app (angular-robot). */
export const ANGULAR_ROBOT: GithubAppMetadata = [43341, 'angular-robot-key'];

/** Create a JWT authenticated App client to manage installation tokens. */
async function getJwtAuthedAppClient([appId, inputKey]: GithubAppMetadata) {
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

/**
 * Retrieves an installation auth token for the provided app.
 *
 * Using our own robot account is preferable as it makes it immediately apparent in context of an
 * issue/pr event that this was performed by the Angular team. Additionally, this allows for us to
 * have another layer of ability to manage access as the Angular app needs to obtain permission to
 * act on a repository, unlike the github-actions robot account which implicitly has access based on
 * where it was executed from.
 */
export async function getAuthTokenFor(app: GithubAppMetadata, org: Org): Promise<string>;
export async function getAuthTokenFor(app: GithubAppMetadata, repo?: Repo): Promise<string>;
export async function getAuthTokenFor(
  app: GithubAppMetadata,
  orgOrRepo: Org | Repo = context.repo,
): Promise<string> {
  const github = await getJwtAuthedAppClient(app);
  let id: number;
  let org = orgOrRepo as Org;
  let repo = orgOrRepo as Repo;

  if (typeof org.org === 'string') {
    id = (await github.apps.getOrgInstallation({...org})).data.id;
  } else {
    id = (await github.apps.getRepoInstallation({...repo})).data.id;
  }

  const {token} = (
    await github.rest.apps.createInstallationAccessToken({
      installation_id: id,
    })
  ).data;

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
