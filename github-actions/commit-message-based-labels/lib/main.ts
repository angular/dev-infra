import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {parseCommitMessage} from '../../../ng-dev/commit-message/parse.js';
import {breakingChangeLabel, deprecationLabel} from '../../../ng-dev/pr/config/index.js';
import {ANGULAR_ROBOT, getAuthTokenFor} from '../../utils.js';

/** List of supported label and commit message attribute combinations. */
const supportedLabels = [
  [breakingChangeLabel, 'breakingChanges'],
  [deprecationLabel, 'deprecations'],
] as const;

async function run(): Promise<void> {
  const token = await getAuthTokenFor(ANGULAR_ROBOT);
  const client = new Octokit({auth: token});
  const {number, owner, repo} = context.issue;
  /** Labels currently applied to the PR. */
  const labels = await (
    await client.issues.listLabelsOnIssue({issue_number: number, owner, repo})
  ).data;
  /** Parsed commit message for every commit on the PR. */
  const commits = await (
    await client.paginate(client.pulls.listCommits, {owner, pull_number: number, repo})
  ).map(({commit: {message}}) => parseCommitMessage(message));

  console.log(`PR #${number}`);

  // Add or Remove label as appropriate for each of the supported label and commit messaage
  // combinations.
  for (const [label, commitProperty] of supportedLabels) {
    const hasCommit = commits.some((commit) => commit[commitProperty].length > 0);
    const hasLabel = labels.some(({name}) => name === label);
    console.log(`${commitProperty} | hasLabel: ${hasLabel} | hasCommit: ${hasCommit}`);

    if (hasCommit && !hasLabel) {
      await client.issues.addLabels({
        repo,
        owner,
        issue_number: number,
        labels: [label],
      });
      console.log(`Added ${label} label to PR #${number}`);
    }
    if (!hasCommit && hasLabel) {
      await client.issues.removeLabel({
        repo,
        owner,
        issue_number: number,
        name: label,
      });
      console.log(`Removed ${label} label from PR #${number}`);
    }
  }
}

// Only run if the action is executed in a repository within the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  run();
} else {
  core.warning(
    'Automatic labeling was skipped as this action is only meant to run ' +
      'in repos belonging to the Angular organization.',
  );
}
