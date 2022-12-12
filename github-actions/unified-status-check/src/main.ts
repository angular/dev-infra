import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {PullRequest} from './pull-request.js';
import {isDraft} from './validators/draft-mode.js';
import {checkOnlyPassingStatuses, checkRequiredStatuses} from './validators/statuses.js';
import {checkForTargelLabel, isMergeReady} from './validators/labels.js';
import {buildCheckResultOutput, ValidationResults} from './validator.js';

/** The validation functions for check against the pull request. */
const validators = [
  isDraft,
  isMergeReady,
  checkRequiredStatuses,
  checkOnlyPassingStatuses,
  checkForTargelLabel,
];

async function main() {
  /** A Github API instance. */
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});

  try {
    /** The pull request triggering the event */
    const pullRequest = await PullRequest.get(github);
    /** The results of the validation functions, organized by validation result state. */
    const validationResultByState: ValidationResults = {
      pending: [],
      success: [],
      failure: [],
    };

    // Run all of the validators and sort the results.
    validators.forEach((validator) => {
      const result = validator(pullRequest);
      validationResultByState[result.state].push(result);
    });

    await pullRequest.setCheckResult(buildCheckResultOutput(validationResultByState, pullRequest));
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
