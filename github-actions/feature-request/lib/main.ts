import * as core from '@actions/core';
import {context} from '@actions/github';
import {getAuthTokenFor, ANGULAR_ROBOT, revokeActiveInstallationToken} from '../../utils.js';
import {run} from './action.js';
import {getInputValue} from './get-input.js';
import {OctoKit} from './octokit.js';

(async () => {
  let installationOctokit: OctoKit | null = null;

  try {
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    /** The Octokit instance for interacting with Github. */
    installationOctokit = new OctoKit(token, {
      repo: context.repo.repo,
      owner: context.repo.owner,
    });

    // Run the action with the specified values in the YAML configuration.
    await run(installationOctokit, {
      organization: context.repo.owner,
      closeAfterWarnDaysDuration: getInputValue('close-after-warn-days-duration'),
      closeComment: getInputValue('close-comment'),
      featureRequestLabel: getInputValue('feature-request-label'),
      inBacklogLabel: getInputValue('in-backlog-label'),
      minimumUniqueCommentAuthorsForConsideration: getInputValue(
        'minimum-unique-comment-authors-for-consideration',
      ),
      minimumVotesForConsideration: getInputValue('minimum-votes-for-consideration'),
      oldIssueWarnDaysDuration: getInputValue('old-issue-warn-days-duration'),
      requiresVotesLabel: getInputValue('requires-votes-label'),
      startVotingComment: getInputValue('start-voting-comment'),
      underConsiderationLabel: getInputValue('under-consideration-label'),
      warnComment: getInputValue('warn-comment'),
      warnDaysDuration: getInputValue('warn-days-duration'),
      closeWhenNoSufficientVotes: getInputValue('close-when-no-sufficient-votes'),
      insufficientVotesLabel: getInputValue('insufficient-votes-label'),
      limit: getInputValue('limit'),
    });
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
    throw error;
  } finally {
    if (installationOctokit !== null) {
      await revokeActiveInstallationToken(installationOctokit.octokit);
    }
  }
})();
