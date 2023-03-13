/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {bold, green, Log} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';
import {isGithubApiError} from '../../utils/git/github.js';

import {PullRequest} from './actions.js';
import {isPullRequestMerged} from './pull-request-state.js';

/**
 * Prints the pull request to the console and informs the user about
 * the process of getting the pull request merged.
 *
 * The user will then be prompted, allowing the user to initiate the
 * merging. The tool will then attempt to merge the pull request
 * automatically.
 */
export async function promptToInitiatePullRequestMerge(
  git: AuthenticatedGitClient,
  {id, url}: PullRequest,
): Promise<void> {
  Log.info();
  Log.info();
  Log.info(green(bold(`      Pull request #${id} is sent out for review: ${url}`)));
  Log.warn(bold(`      Do not merge it manually. The tool will automatically merge it.`));
  Log.info('');
  Log.warn(`      The tool is ${bold('not')} ensuring that all tests pass. Branch protection`);
  Log.warn('      rules always apply, but other non-required checks can be skipped.');
  Log.info('');
  Log.info(`      If you think it is ready (i.e. has the necessary approvals), you can continue`);
  Log.info(`      by confirming the prompt. The tool will then auto-merge the PR if possible.`);
  Log.info('');

  // We will loop forever until the PR has been merged. If a user wants to abort,
  // the script needs to be aborted e.g. using CTRL + C.
  while (true) {
    if (!(await Prompt.confirm(`Do you want to continue with merging PR #${id}?`))) {
      continue;
    }

    Log.info(`      Attempting to merge pull request #${id}..`);
    Log.info(``);

    try {
      // Special logic that will check if the pull request is already merged. This should never
      // happen but there may be situations where a caretaker merged manually. We wouldn't want
      // the process to stuck forever here but continue given the caretaker explicitly confirming
      // that they would like to continue (assuming they expect the PR to be recognized as merged).
      if (await gracefulCheckIfPullRequestIsMerged(git, id)) {
        break;
      }

      const {data, status, headers} = await git.github.pulls.merge({
        ...git.remoteParams,
        pull_number: id,
        merge_method: 'rebase',
      });

      // If merge is successful, break out of the loop and complete the function.
      if (data.merged) {
        break;
      }

      // Octokit throws for non-200 status codes, but there may be unknown cases
      // where `merged` is false but we have a 200 status code. We handle this here
      // and allow for the merge to be re-attempted.
      Log.error(`  ✘   Pull request #${id} could not be merged.`);
      Log.error(`      ${data.message} (${status})`);
      Log.debug(data, status, headers);
    } catch (e) {
      if (!isGithubApiError(e)) {
        throw e;
      }

      // If there is an request error, e.g. 403 permissions or insufficient permissions
      // due to active branch protections, then we want to print the message and allow
      // for the user to re-attempt the merge (by continuing in the loop).
      Log.error(`  ✘   Pull request #${id} could not be merged.`);
      Log.error(`      ${e.message} (${e.status})`);
      Log.debug(e);
    }
  }

  Log.info(green(`  ✓   Pull request #${id} has been merged.`));
}

/** Gracefully checks whether the given pull request has been merged. */
async function gracefulCheckIfPullRequestIsMerged(
  git: AuthenticatedGitClient,
  id: number,
): Promise<boolean> {
  try {
    return await isPullRequestMerged(git, id);
  } catch (e) {
    if (isGithubApiError(e)) {
      Log.debug(`Unable to determine if pull request #${id} has been merged.`);
      Log.debug(e);
      return false;
    }
    throw e;
  }
}
