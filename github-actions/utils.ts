import {getInput, info} from '@actions/core';
import {Octokit} from '@octokit/rest';
import {createAppAuth} from '@octokit/auth-app';
import {context} from '@actions/github';

export type GithubAppMetadata = [appId: number, inputKey: string];

/** Angular Lock Bot Github app (angular-lock-bot). */
export const ANGULAR_LOCK_BOT: GithubAppMetadata = [40213, 'lock-bot-key'];
/** Angular Robot Github app (angular-robot). */
export const ANGULAR_ROBOT: GithubAppMetadata = [43341, 'angular-robot-key'];

/** Create a JWT authenticated Github client to manage installation tokens. */
async function getJwtAuthedGithubClient([appId, inputKey]: GithubAppMetadata) {
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
export async function getAuthTokenFor(app: GithubAppMetadata): Promise<string> {
  const github = await getJwtAuthedGithubClient(app);

  const {id: installationId} = (
    await github.apps.getRepoInstallation({
      ...context.repo,
    })
  ).data;

  const {token} = (
    await github.rest.apps.createInstallationAccessToken({
      installation_id: installationId,
    })
  ).data;

  return token;
}

/** Revoke the generated authentication token for the provided app.  */
export async function revokeAuthTokenFor(app: GithubAppMetadata): Promise<void> {
  const github = await getJwtAuthedGithubClient(app);
  await github.rest.apps.revokeInstallationAccessToken();
  info('Revoked installation token used for Angular Robot.');
}
