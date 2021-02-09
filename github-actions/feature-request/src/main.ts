import * as core from '@actions/core';
import { context } from '@actions/github';
import { run } from './action';
import { OctoKit } from './octokit';

// Gets a specific value from the YAML configuration.
// The value could be either a number or a string.
const v = <T extends number|string|boolean>(name: string): T => {
  const result = core.getInput(name);
  if (!result) {
    throw new Error(`Value for ${name} not specified.`);
  }
  if (/^(true|false)$/.test(result)) {
    return (result === 'true' ? true : false) as T;
  }
  if (!/^\d+(\.\d*)$/.test(result)) {
    return result as T;
  }
  const num = parseFloat(result);
  if (isNaN(num)) {
    throw new Error(`Can't parse ${name} as a numeric value.`);
  }
  return num as T;
};

const octokit = new OctoKit(v('token'), {
  repo: context.repo.repo,
  owner: context.repo.owner,
});

// Run the action with the specified values in the YAML configuration.
run(octokit, {
  organization: context.repo.owner,
  closeAfterWarnDaysDuration: v('close-after-warn-days-duration'),
  closeComment: v('close-comment'),
  featureRequestLabel: v('feature-request-label'),
  inBacklogLabel: v('in-backlog-label'),
  minimumUniqueCommentAuthorsForConsideration: v('minimum-unique-comment-authors-for-consideration'),
  minimumVotesForConsideration: v('minimum-votes-for-consideration'),
  oldIssueWarnDaysDuration: v('old-issue-warn-days-duration'),
  requiresVotesLabel: v('requires-votes-label'),
  startVotingComment: v('start-voting-comment'),
  underConsiderationLabel: v('under-consideration-label'),
  warnComment: v('warn-comment'),
  warnDaysDuration: v('warn-days-duration'),
  closeWhenNoSufficientVotes: v('close-when-no-sufficient-votes'),
  insufficientVotesLabel: v('insufficient-votes-label')
})
