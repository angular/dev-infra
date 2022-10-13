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

/**
 * Retrieves an installation auth token for the provided app.
 *
 * Using our own robot account is preferable as it makes it immediately apparent in context of an
 * issue/pr event that this was performed by the Angular team. Additionally, this allows for us to
 * have another layer of ability to manage access as the Angular app needs to obtain permission to
 * act on a repository, unlike the github-actions robot account which implicitly has access based on
 * where it was  executed from.
 */
export async function getAuthTokenFor(app: GithubAppMetadata, useOrgInstallation: boolean = false): Promise<string> {
  const github = await getJwtAuthedAppClient(app);

  const {id: installationId} = (await 
    (useOrgInstallation ? 
      github.apps.getOrgInstallation({org: context.repo.owner}) :
      github.apps.getRepoInstallation({...context.repo}))).data;

  const {token} = (
    await github.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
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
    await new Octokit({auth: githubOrToken}).apps.revokeInstallationAccessToken();
  } else {
    await githubOrToken.apps.revokeInstallationAccessToken();
  }
  info('Revoked installation token used for Angular Robot.');
}
