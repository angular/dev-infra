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
): Promise<void> {
  const labels = pullRequest.labels.nodes.map((l) => l.name);
  const commitsInPr = pullRequest.commits.nodes.map((n) => {
    return parseCommitMessage(n.commit.message);
  });

  await mergeReadyValidation.run(validationConfig, (v) => v.assert(pullRequest));
  await signedClaValidation.run(validationConfig, (v) => v.assert(pullRequest));
  await pendingStateValidation.run(validationConfig, (v) => v.assert(pullRequest));

  if (activeReleaseTrains !== null) {
    await changesAllowForTargetLabelValidation.run(validationConfig, (v) =>
      v.assert(commitsInPr, target.labelName, ngDevConfig.pullRequest, activeReleaseTrains, labels),
    );
  }

  await breakingChangeInfoValidation.run(validationConfig, (v) => v.assert(commitsInPr, labels));
  await passingCiValidation.run(validationConfig, (v) => v.assert(pullRequest));
}
