/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActiveReleaseTrains} from '../../release/versioning/active-release-trains.js';
import {getNextBranchName} from '../../release/versioning/version-branches.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {addTokenToGitHttpsUrl} from '../../utils/git/github-urls.js';
import {green, Log, yellow} from '../../utils/logging.js';
import {checkOutPullRequestLocally} from '../common/checkout-pr.js';

export async function checkoutToTargetBranch(
  prNumber: number,
  target: string,
  {pullRequest}: Awaited<ReturnType<typeof checkOutPullRequestLocally>>,
) {
  /** An authenticated git client. */
  const git = await AuthenticatedGitClient.get();
  const config = git.config;

  const branchName = `pr-${target.toLowerCase().replaceAll(/[\W_]/gm, '-')}-${prNumber}`;
  const {owner, name: repo} = config.github;
  const activeReleaseTrains = await ActiveReleaseTrains.fetch({
    name: repo,
    owner: owner,
    nextBranchName: getNextBranchName(config.github),
    api: git.github,
  });

  let targetBranch = target;
  let targetName = target;

  if (
    target === 'patch' ||
    target === 'latest' ||
    activeReleaseTrains.latest.branchName === target
  ) {
    targetName = 'patch';
    targetBranch = activeReleaseTrains.latest.branchName;
  } else if (
    target === 'main' ||
    target === 'next' ||
    target === 'minor' ||
    activeReleaseTrains.next.branchName === target
  ) {
    targetName = 'main';
    targetBranch = activeReleaseTrains.next.branchName;
  } else if (
    activeReleaseTrains.releaseCandidate &&
    (target === 'rc' || activeReleaseTrains.releaseCandidate.branchName === target)
  ) {
    targetName = 'rc';
    targetBranch = activeReleaseTrains.releaseCandidate.branchName;
  }
  Log.info(`Targeting '${targetBranch}' branch\n`);

  const baseRefUrl = addTokenToGitHttpsUrl(pullRequest.baseRef.repository.url, git.githubToken);

  git.run(['checkout', '-q', targetBranch]);
  git.run(['fetch', '-q', baseRefUrl, targetBranch, '--deepen=500']);
  git.run(['checkout', '-b', branchName]);

  Log.info(`Running cherry-pick`);

  try {
    const revisionRange = `${pullRequest.baseRefOid}..${pullRequest.headRefOid}`;
    git.run(['cherry-pick', revisionRange]);
    Log.info(
      ` ${green('✔')} Cherry-pick is complete. You can now push to create a new pull request.`,
    );
  } catch {
    Log.info(
      ` ${yellow('⚠')} Cherry-pick resulted in conflicts. Please resolve them manually and push to create your patch PR`,
    );
  }
}
