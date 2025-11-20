/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../logging.js';

import {Argv} from 'yargs';
import {AuthenticatedGitClient} from './authenticated-git-client.js';
import {ChildProcess} from '../child-process.js';

/** Sets up the `github-token` command option for the given Yargs instance. */
export function addGithubTokenOption<T>(argv: Argv<T>) {
  return (
    argv
      // 'github-token' is casted to 'githubToken' to properly set up typings to reflect the key in
      // the Argv object being camelCase rather than kebab case due to the `camel-case-expansion`
      // config: https://github.com/yargs/yargs-parser#camel-case-expansion
      .option('github-token' as 'githubToken', {
        type: 'string',
        default: '',
        defaultDescription: '<LOCAL_TOKEN>',
        description: 'Github token. If not set, a token is retreived via the gh CLI',
        // We use the coerce function as a way of allowing the user to provide the value, otherwise
        // looking for it in the environment.
        coerce: configureGitClientWithTokenOrFromEnvironment,
      })
  );
}

/**
 * If the github token is able to be determined, either by being provided as a parameter, retrieved
 * via the gh CLI or being present in the environment, it is used to set the configuration for the
 * AuthenticatedGitClient. Otherwise, an error is thrown.
 *
 * We explicitly return void for this function to allow this function to be used as a `coerce`
 * function for yargs. This allows for the option, `github-token` to be available for users without
 * including it in the generated types for the `Argv` object on a command, helping us to enforce
 * that the token should only be accessed from the AuthenticatedGitClient itself.
 */
export function configureGitClientWithTokenOrFromEnvironment(token: string | undefined): void {
  const determineToken = () => {
    if (token) {
      Log.debug('Recieved github token via --github-token flag');
      return token;
    }

    try {
      /** Silent mode is used to prevent the token lookup from being printed into the logs. */
      const mode = 'silent';
      const ghCliToken = ChildProcess.spawnSync('gh', ['auth', 'token'], {mode}).stdout.trim();
      if (ghCliToken) {
        Log.debug('Retrieved github token via gh CLI');
        return ghCliToken;
      }
    } catch (err) {
      Log.debug('Failed to retrieve github token via gh CLI');
      Log.debug(err);
    }

    // TODO(josephperrott): remove support for retrieving tokens via the environment.
    const envToken = process.env['GITHUB_TOKEN'] ?? process.env['TOKEN'];
    if (envToken) {
      Log.warn(' ⚠  Retrieved github token via environment variable, retrieving tokens via');
      Log.warn('    environment variables has been deprecated and will be removed in the future');
      Log.warn('    please set up authentication via the Github CLI for future use.');
      return envToken;
    }
    return undefined;
  };
  const githubToken = determineToken();
  if (githubToken === undefined) {
    Log.error('  ✘ No Github token set. Please configure authentication using the Github CLI.');
    Log.error('    Alternatively, pass the `--github-token` command line flag.');
    throw Error('Unable to determine the Github token.');
  }

  AuthenticatedGitClient.configure(githubToken);
}
