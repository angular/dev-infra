/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, ConfigValidationError, getConfig} from '../../utils/config.js';
import {bold, Log} from '../../utils/logging.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {isGithubApiError} from '../../utils/git/github.js';
import {GITHUB_TOKEN_GENERATE_URL} from '../../utils/git/github-urls.js';

import {assertValidPullRequestConfig} from '../config/index.js';
import {MergeTool, PullRequestMergeFlags} from './merge-tool.js';
import {
  FatalMergeToolError,
  PullRequestValidationError,
  UserAbortedMergeToolError,
} from './failures.js';
import {createPullRequestValidationConfig} from '../common/validation/validation-config.js';
import {
  InvalidTargetBranchError,
  InvalidTargetLabelError,
} from '../common/targeting/target-label.js';

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

  // Perform the merge. If the merge fails with non-fatal failures, the script
  // will prompt whether it should rerun in force mode with the ignored failure.
  if (!(await performMerge())) {
    process.exit(1);
  }

  /** Performs the merge and returns whether it was successful or not. */
  async function performMerge(
    validationConfig = {
      assertCompletedReviews: !flags.ignorePendingReviews,
    },
  ): Promise<boolean> {
    try {
      await tool.merge(prNumber, validationConfig);
      return true;
    } catch (e) {
      // Catch errors to the Github API for invalid requests. We want to
      // exit the script with a better explanation of the error.
      if (isGithubApiError(e) && e.status === 401) {
        Log.error('Github API request failed: ' + bold(e.message));
        Log.error('Please ensure that your provided token is valid.');
        Log.warn(`You can generate a token here: ${GITHUB_TOKEN_GENERATE_URL}`);
        return false;
      }
      if (isGithubApiError(e)) {
        Log.error('Github API request failed: ' + bold(e.message));
        return false;
      }
      if (e instanceof UserAbortedMergeToolError) {
        Log.warn('Manually aborted merging..');
        return false;
      }
      if (e instanceof InvalidTargetBranchError) {
        Log.error(`Pull request selects an invalid GitHub destination branch:`);
        Log.error(` -> ${bold(e.failureMessage)}`);
      }
      if (e instanceof InvalidTargetLabelError) {
        Log.error(`Pull request target label could not be determined:`);
        Log.error(` -> ${bold(e.failureMessage)}`);
      }

      if (e instanceof PullRequestValidationError) {
        Log.error('Pull request failed at least one validation check.');
        Log.error('See above for specific error information');
        return false;
      }

      // Note: Known errors in the merge tooling extend from the FatalMergeToolError, as such
      // the instance check for FatalMergeToolError should remain last as it will be truthy for
      // all of the subclasses.
      if (e instanceof FatalMergeToolError) {
        Log.error(`Could not merge the specified pull request. Error:`);
        Log.error(` -> ${bold(e.message)}`);
        return false;
      }

      // For unknown errors, always re-throw.
      throw e;
    }
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
