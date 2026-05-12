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
import {fetchPullRequestFromGithub, PullRequestFromGithub} from '../fetch-pull-request.js';
import {Log} from '../../../utils/logging.js';
import {Spinner} from '../../../utils/spinner.js';
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
import {setTimeout} from 'node:timers/promises';

/**
 * Runs all valiations that the given pull request is valid, returning a list of all failing
 * validations.
 *
 * Active release trains may be available for additional checks or not.
 */
async function runValidations(
  pullRequest: PullRequestFromGithub,
  validationConfig: PullRequestValidationConfig,
  ngDevConfig: NgDevConfig<{pullRequest: PullRequestConfig; github: GithubConfig}>,
  activeReleaseTrains: ActiveReleaseTrains | null,
  target: PullRequestTarget,
  gitClient: AuthenticatedGitClient,
): Promise<PullRequestValidationFailure[]> {
  const labels = pullRequest.labels.nodes.map((l) => l.name);
  const commitsInPr = pullRequest.commits.nodes.map((n) => {
    return parseCommitMessage(n.commit.message);
  });

  const validationPromises = [
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
    validationPromises.push(
      changesAllowForTargetLabelValidation.run(
        validationConfig,
        commitsInPr,
        target.label,
        ngDevConfig.pullRequest,
        activeReleaseTrains,
        labels,
        pullRequest,
      ),
    );
  }

  const results = await Promise.all(validationPromises);
  return results.filter((result): result is PullRequestValidationFailure => result !== null);
}

export async function assertValidPullRequest(
  originalPullRequest: PullRequestFromGithub,
  validationConfig: PullRequestValidationConfig,
  ngDevConfig: NgDevConfig<{
    pullRequest: PullRequestConfig;
    github: GithubConfig;
  }>,
  activeReleaseTrains: ActiveReleaseTrains | null,
  target: PullRequestTarget,
  gitClient: AuthenticatedGitClient,
): Promise<PullRequestValidationFailure[]> {
  let pullRequest = originalPullRequest;
  let spinner: Spinner | undefined;
  const maxAttempts = 60;
  let attempts = 0;

  while (true) {
    const failures = await runValidations(
      pullRequest,
      validationConfig,
      ngDevConfig,
      activeReleaseTrains,
      target,
      gitClient,
    );

    const finalFailures = failures.filter((f) => f.isFinal);
    const nonFinalFailures = failures.filter((f) => !f.isFinal);

    const shouldWaitForPending =
      nonFinalFailures.length > 0 && finalFailures.length === 0 && validationConfig.waitIfPending;

    if (!shouldWaitForPending) {
      if (spinner) {
        spinner.complete();
      }
      return failures;
    }

    if (attempts >= maxAttempts) {
      if (spinner) {
        spinner.complete();
      }
      Log.error(
        `Timed out waiting for non-final validations to complete after ${maxAttempts} minutes.`,
      );
      return failures;
    }

    const names = nonFinalFailures.map((f) => f.validationName).join(', ');
    const verb = nonFinalFailures.length === 1 ? 'is' : 'are';
    const spinnerText = `[${names}] ${verb} not final. Waiting for completion (attempt ${attempts + 1}/${maxAttempts})...`;

    if (!spinner) {
      spinner = new Spinner(spinnerText);
    } else {
      spinner.update(spinnerText);
    }

    await setTimeout(60000); // Wait 1 minute
    const freshPr = await fetchPullRequestFromGithub(gitClient, originalPullRequest.number);
    if (!freshPr) {
      throw new Error('Failed to re-fetch pull request data');
    }
    pullRequest = freshPr;
    attempts++;
  }
}
