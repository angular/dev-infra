/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../logging.js';

import {Argv} from 'yargs';
import {AuthenticatedGitClient} from './authenticated-git-client.js';
import {GITHUB_TOKEN_GENERATE_URL} from './github-urls.js';

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
        description: 'Github token. If not set, token is retrieved from the environment variables.',
        // We use the coerce function as a way of allowing the user to provide the value, otherwise
        // looking for it in the environment.
        coerce: configureGitClientWithTokenOrFromEnvironment,
      })
  );
}

/**
 * If the github token is able to be determined, either by being provided as a parameter or being
 * present in the environment, it is used to set the configuration for the AuthenticatedGitClient.
 * Otherwise, an error is thrown.
 *
 * We explicitly return void for this function to allow this function to be used as a `coerce`
 * function for yargs. This allows for the option, `github-token` to be available for users without
 * including it in the generated types for the `Argv` object on a command, helping us to enforce
 * that the token should only be accessed from the AuthenticatedGitClient itself.
 */
export function configureGitClientWithTokenOrFromEnvironment(token: string | undefined): void {
  const githubToken = token || (process.env.GITHUB_TOKEN ?? process.env.TOKEN);
  if (!githubToken) {
    Log.error('No Github token set. Please set the `GITHUB_TOKEN` environment variable.');
    Log.error('Alternatively, pass the `--github-token` command line flag.');
    Log.warn(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
    throw Error('Unable to determine the Github token.');
  }

  AuthenticatedGitClient.configure(githubToken);
}
