/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig, GithubConfig} from '../../utils/config';
import {Log} from '../../utils/logging';
import {GitClient} from '../../utils/git/git-client';
import {assertValidPullRequestConfig, PullRequestConfig} from '../config';
import {getTargetBranchesForPullRequest} from '../common/targeting/target-label';

async function getTargetBranchesForPr(
  prNumber: number,
  config: {github: GithubConfig; pullRequest: PullRequestConfig},
) {
  /** Repo owner and name for the github repository. */
  const {owner, name: repo} = config.github;
  /** The singleton instance of the GitClient. */
  const git = GitClient.get();

  /** The current state of the pull request from Github. */
  const prData = (await git.github.pulls.get({owner, repo, pull_number: prNumber})).data;
  /** The list of labels on the PR as strings. */
  // Note: The `name` property of labels is always set but the Github OpenAPI spec is incorrect
  // here.
  // TODO(devversion): Remove the non-null cast once
  // https://github.com/github/rest-api-description/issues/169 is fixed.
  const labels = prData.labels.map((l) => l.name!);
  /** The branch targetted via the Github UI. */
  const githubTargetBranch = prData.base.ref;

  // Note: We do not pass a list of commits here because we did not fetch this information
  // and the commits are only used for validation (which we can skip here).
  return getTargetBranchesForPullRequest(git.github, config, labels, githubTargetBranch, []);
}

export async function printTargetBranchesForPr(prNumber: number) {
  const config = getConfig();
  assertValidGithubConfig(config);
  assertValidPullRequestConfig(config);

  if (config.pullRequest.noTargetLabeling) {
    Log.info(`PR #${prNumber} will merge into: ${config.github.mainBranchName}`);
    return;
  }

  const targets = await getTargetBranchesForPr(prNumber, config);
  Log.info.group(`PR #${prNumber} will merge into:`);
  targets.forEach((target) => Log.info(`- ${target}`));
  Log.info.groupEnd();
}
