import * as core from '@actions/core';
import { context } from '@actions/github';
import { run } from './action';
import { OctoKit } from './octokit';
const { getToken } = require('github-app-installation-token');



// Gets a specific value from the YAML configuration.
// The value could be either a number or a string.
const getInputValue = <T extends number|string|boolean>(name: string): T => {
  const result = core.getInput(name);
  if (!result) {
    throw new Error(`No value for ${name} specified in the configuration.`);
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


(async () => {
  try {
    // A immediately executed async function to allow `await`ing the installation access token.
      /** The private key for the angular robot app. */
      const privateKey = getInputValue<string>('angular-robot-key');
      /** Github App id of the Angular Robot app. */
      const appId = 43341;
      /** Installation id of the Angular Robot app. */
      const installationId = 2813208;
      // The Angular Lock Bot Github application
      const {token} = await getToken({ installationId, appId, privateKey });
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
        minimumUniqueCommentAuthorsForConsideration: getInputValue('minimum-unique-comment-authors-for-consideration'),
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
      })
  } catch (e) {
    core.setFailed(e)
  }
})();
