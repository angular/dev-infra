import * as core from '@actions/core';
import {context} from '@actions/github';
import {getAuthTokenFor, ANGULAR_ROBOT} from '../../utils';
import {run} from './action';
import {getInputValue} from './get-input';
import {OctoKit} from './octokit';

(async () => {
  try {
    // A immediately executed async function to allow `await`ing the installation access token.
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    /** The Octokit instance for interacting with Github. */
    const octokit = new OctoKit(token, {
      repo: context.repo.repo,
      owner: context.repo.owner,
    });

    // Run the action with the specified values in the YAML configuration.
    await run(octokit, {
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
  }
})();
