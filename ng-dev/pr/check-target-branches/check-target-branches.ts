/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig, GithubConfig, NgDevConfig} from '../../utils/config.js';
import {Log} from '../../utils/logging.js';
import {GitClient} from '../../utils/git/git-client.js';
import {assertValidPullRequestConfig, PullRequestConfig} from '../config/index.js';
import {getTargetBranchesAndLabelForPullRequest} from '../common/targeting/target-label.js';
import {ActiveReleaseTrains} from '../../release/versioning/active-release-trains.js';
import {getNextBranchName} from '../../release/versioning/version-branches.js';

async function getTargetBranchesForPr(
  prNumber: number,
  config: NgDevConfig<{github: GithubConfig; pullRequest: PullRequestConfig}>,
) {
  /** Repo owner and name for the github repository. */
  const {owner, name: repo} = config.github;
  /** The singleton instance of the GitClient. */
  const git = await GitClient.get();

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

  const activeReleaseTrains = await ActiveReleaseTrains.fetch({
    name: repo,
    owner: owner,
    nextBranchName: getNextBranchName(config.github),
    api: git.github,
  });

  // Note: We do not pass a list of commits here because we did not fetch this information
  // and the commits are only used for validation (which we can skip here).
  return getTargetBranchesAndLabelForPullRequest(
    activeReleaseTrains,
    git.github,
    config,
    labels,
    githubTargetBranch,
  );
}

export async function printTargetBranchesForPr(prNumber: number) {
  const config = await getConfig();
  assertValidGithubConfig(config);
  assertValidPullRequestConfig(config);

  if (config.pullRequest.__noTargetLabeling) {
    Log.info(`This repository does not use target labeling (special flag enabled).`);
    Log.info(`PR #${prNumber} will merge into: ${config.github.mainBranchName}`);
    return;
  }

  const target = await getTargetBranchesForPr(prNumber, config);
  Log.info(`PR has the following target label: ${target.label.name}`);
  Log.info.group(`PR #${prNumber} will merge into:`);
  target.branches.forEach((name) => Log.info(`- ${name}`));
  Log.info.groupEnd();
}
