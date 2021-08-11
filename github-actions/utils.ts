import {getInput} from '@actions/core';
const {getToken} = require('github-app-installation-token');

/**
 * Retrieves an installation auth token for the angular-robot bot account.
 *
 * Using our own robot account is preferable as it makes it immediately apparent in context of an
 * issue/pr event that this was performed by the Angular team. Additionally, this allows for us to
 * have another layer of ability to manage access as the Angular app needs to obtain permission to
 * act on a repository, unlike the github-actions robot account which implicitly has access based on
 * where it was  executed from.
 */
export async function getAuthTokenForAngularRobotApp(): Promise<string>;
export async function getAuthTokenForAngularRobotApp(
  inputKey = 'angular-robot-key',
): Promise<string> {
  /** The private key for the angular robot app. */
  const privateKey = getInput('angular-robot-key');
  /** Github App id of the Angular Robot app. */
  const appId = 43341;
  /** Installation id of the Angular Robot app. */
  const installationId = 2813208;
  // The Angular Lock Bot Github application
  const {token} = await getToken({installationId, appId, privateKey});

  return token;
}
