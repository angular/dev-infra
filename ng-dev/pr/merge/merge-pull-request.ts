/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, ConfigValidationError, getConfig} from '../../utils/config.js';
import {green, Log, yellow} from '../../utils/logging.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GithubApiRequestError} from '../../utils/git/github.js';
import {GITHUB_TOKEN_GENERATE_URL} from '../../utils/git/github-urls.js';

import {assertValidPullRequestConfig} from '../config/index.js';
import {MergeTool, PullRequestMergeFlags} from './merge-tool.js';
import {Prompt} from '../../utils/prompt.js';
import {FatalMergeToolError, UserAbortedMergeToolError} from './failures.js';
import {PullRequestFailure} from '../common/validation/pull-request-failure.js';

/**
 * Merges a given pull request based on labels configured in the given merge configuration.
 * Pull requests can be merged with different strategies such as the Github API merge
 * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
 * More information on these strategies can be found in their dedicated strategy classes.
 *
 * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
 *
 * @param prNumber Number of the pull request that should be merged.
 * @param flags Configuration options for merging pull requests.
 */
export async function mergePullRequest(prNumber: number, flags: PullRequestMergeFlags) {
  // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
  // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
  process.env['HUSKY'] = '0';

  const tool = await createPullRequestMergeTool(flags);

  // Perform the merge. Force mode can be activated through a command line flag.
  // Alternatively, if the merge fails with non-fatal failures, the script
  // will prompt whether it should rerun in force mode.
  if (!(await performMerge(false))) {
    process.exit(1);
  }

  /** Performs the merge and returns whether it was successful or not. */
  async function performMerge(ignoreFatalErrors: boolean): Promise<boolean> {
    try {
      await tool.merge(prNumber, /* force */ ignoreFatalErrors);
      Log.info(green(`Successfully merged the pull request: #${prNumber}`));
      return true;
    } catch (e) {
      // Catch errors to the Github API for invalid requests. We want to
      // exit the script with a better explanation of the error.
      if (e instanceof GithubApiRequestError && e.status === 401) {
        Log.error('Github API request failed. ' + e.message);
        Log.error('Please ensure that your provided token is valid.');
        Log.warn(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
        return false;
      }
      if (e instanceof UserAbortedMergeToolError) {
        Log.warn('Manually aborted merging..');
        return false;
      }
      if (e instanceof FatalMergeToolError) {
        Log.error(`Could not merge the specified pull request.`);
        Log.error(e.message);
        return false;
      }
      if (e instanceof PullRequestFailure) {
        Log.error(`Could not merge the specified pull request.`);
        Log.error(e.message);

        // If the failure can be ignored forcibly and we didn't attempt the current
        // merge forcibly already, we can prompt and ask for force attempting.
        if (e.canBeIgnoredNonFatal && !ignoreFatalErrors) {
          Log.info();
          Log.info(yellow('The pull request above failed due to non-critical errors.'));
          Log.info(yellow(`This error can be forcibly ignored if desired.`));
          return await promptAndPerformForceMerge();
        } else {
          return false;
        }
      }

      // For unknown errors, always re-throw.
      throw e;
    }
  }

  /**
   * Prompts whether the specified pull request should be forcibly merged. If so, merges
   * the specified pull request forcibly (ignoring non-fatal failures).
   * @returns Whether the specified pull request has been forcibly merged.
   */
  async function promptAndPerformForceMerge(): Promise<boolean> {
    if (await Prompt.confirm('Do you want to forcibly proceed with merging?')) {
      // Perform the merge in force mode. This means that non-fatal failures
      // are ignored and the merge continues.
      return performMerge(true);
    }
    return false;
  }
}

/**
 * Creates the pull request merge tool using the given configuration options.
 *
 * Explicit configuration options can be specified when the merge script is used
 * outside of an `ng-dev` configured repository.
 */
async function createPullRequestMergeTool(flags: PullRequestMergeFlags) {
  try {
    const config = await getConfig();
    assertValidGithubConfig(config);
    assertValidPullRequestConfig(config);
    /** The singleton instance of the authenticated git client. */
    const git = await AuthenticatedGitClient.get();

    return new MergeTool(config, git, flags);
  } catch (e) {
    if (e instanceof ConfigValidationError) {
      if (e.errors.length) {
        Log.error('Invalid merge configuration:');
        e.errors.forEach((desc) => Log.error(`  -  ${desc}`));
      } else {
        Log.error(e.message);
      }
      process.exit(1);
    }
    throw e;
  }
}
