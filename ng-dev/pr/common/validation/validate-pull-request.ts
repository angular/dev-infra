/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {parseCommitMessage} from '../../../commit-message/parse.js';
import {ActiveReleaseTrains} from '../../../release/versioning/active-release-trains.js';
import {NgDevConfig, GithubConfig} from '../../../utils/config.js';
import {PullRequestConfig} from '../../config/index.js';
import {PullRequestFromGithub} from '../fetch-pull-request.js';
import {PullRequestTarget} from '../targeting/target-label.js';
import {changesAllowForTargetLabelValidation} from './assert-allowed-target-label.js';
import {breakingChangeInfoValidation} from './assert-breaking-change-info.js';
import {mergeReadyValidation} from './assert-merge-ready.js';
import {passingCiValidation} from './assert-passing-ci.js';
import {pendingStateValidation} from './assert-pending.js';
import {signedClaValidation} from './assert-signed-cla.js';
import {PullRequestValidationConfig} from './validation-config.js';
import {PullRequestValidationFailure} from './validation-failure.js';

/**
 * Asserts that the given pull request is valid. Certain non-fatal validations
 * can be disabled through the validation config.
 *
 * Active release trains may be available for additional checks or not.
 *
 * @throws {PullRequestValidationFailure} A validation failure will be raised when
 *   an activated validation failed.
 */
export async function assertValidPullRequest(
  pullRequest: PullRequestFromGithub,
  validationConfig: PullRequestValidationConfig,
  ngDevConfig: NgDevConfig<{pullRequest: PullRequestConfig; github: GithubConfig}>,
  activeReleaseTrains: ActiveReleaseTrains | null,
  target: PullRequestTarget,
): Promise<PullRequestValidationFailure[]> {
  const labels = pullRequest.labels.nodes.map((l) => l.name);
  const commitsInPr = pullRequest.commits.nodes.map((n) => {
    return parseCommitMessage(n.commit.message);
  });

  const validationResults = [
    mergeReadyValidation.run(validationConfig, pullRequest),
    signedClaValidation.run(validationConfig, pullRequest),
    pendingStateValidation.run(validationConfig, pullRequest),
    breakingChangeInfoValidation.run(validationConfig, commitsInPr, labels),
    passingCiValidation.run(validationConfig, pullRequest),
  ];

  if (activeReleaseTrains !== null) {
    validationResults.push(
      changesAllowForTargetLabelValidation.run(
        validationConfig,
        commitsInPr,
        target.labelName,
        ngDevConfig.pullRequest,
        activeReleaseTrains,
        labels,
      ),
    );
  }

  return Promise.all(validationResults).then((results) => {
    return results.filter(
      <(result: null | PullRequestValidationFailure) => result is PullRequestValidationFailure>(
        ((result) => result !== null)
      ),
    );
  });
}
