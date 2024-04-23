/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from '../../../commit-message/parse.js';
import {ActiveReleaseTrains} from '../../../release/versioning/active-release-trains.js';
import {NgDevConfig, GithubConfig} from '../../../utils/config.js';
import {PullRequestConfig, PullRequestValidationConfig} from '../../config/index.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {PullRequestTarget} from '../targeting/target-label.js';
import {changesAllowForTargetLabelValidation} from './assert-allowed-target-label.js';
import {breakingChangeInfoValidation} from './assert-breaking-change-info.js';
import {completedReviewsValidation} from './assert-completed-reviews.js';
import {isolatedSeparateFilesValidation} from './assert-isolated-separate-files.js';
import {enforcedStatusesValidation} from './assert-enforced-statuses.js';
import {enforceTestedValidation} from './assert-enforce-tested.js';
import {mergeReadyValidation} from './assert-merge-ready.js';
import {minimumReviewsValidation} from './assert-minimum-reviews.js';
import {passingCiValidation} from './assert-passing-ci.js';
import {pendingStateValidation} from './assert-pending.js';
import {signedClaValidation} from './assert-signed-cla.js';
import {PullRequestValidationFailure} from './validation-failure.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';

/**
 * Runs all valiations that the given pull request is valid, returning a list of all failing
 * validations.
 *
 * Active release trains may be available for additional checks or not.
 */
export async function assertValidPullRequest(
  pullRequest: PullRequestFromGithub,
  validationConfig: PullRequestValidationConfig,
  ngDevConfig: NgDevConfig<{
    pullRequest: PullRequestConfig;
    github: GithubConfig;
  }>,
  activeReleaseTrains: ActiveReleaseTrains | null,
  target: PullRequestTarget,
  gitClient: AuthenticatedGitClient,
): Promise<PullRequestValidationFailure[]> {
  const labels = pullRequest.labels.nodes.map((l) => l.name);
  const commitsInPr = pullRequest.commits.nodes.map((n) => {
    return parseCommitMessage(n.commit.message);
  });

  const validationResults = [
    minimumReviewsValidation.run(validationConfig, pullRequest),
    completedReviewsValidation.run(validationConfig, pullRequest),
    mergeReadyValidation.run(validationConfig, pullRequest),
    signedClaValidation.run(validationConfig, pullRequest),
    pendingStateValidation.run(validationConfig, pullRequest),
    breakingChangeInfoValidation.run(validationConfig, commitsInPr, labels),
    passingCiValidation.run(validationConfig, pullRequest),
    enforcedStatusesValidation.run(validationConfig, pullRequest, ngDevConfig.pullRequest),
    isolatedSeparateFilesValidation.run(
      validationConfig,
      ngDevConfig,
      pullRequest.number,
      gitClient,
    ),
    enforceTestedValidation.run(validationConfig, pullRequest, gitClient),
  ];

  if (activeReleaseTrains !== null) {
    validationResults.push(
      changesAllowForTargetLabelValidation.run(
        validationConfig,
        commitsInPr,
        target.label,
        ngDevConfig.pullRequest,
        activeReleaseTrains,
        labels,
      ),
    );
  }

  return await Promise.all(validationResults).then((results) => {
    return results.filter(
      <(result: null | PullRequestValidationFailure) => result is PullRequestValidationFailure>(
        ((result) => result !== null)
      ),
    );
  });
}
