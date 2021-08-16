import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {parseCommitMessage} from '../../ng-dev/commit-message/parse';
import {getAuthTokenForAngularRobotApp} from '../utils';
import {breakingChangeLabel} from '../../ng-dev/pr/merge/constants';

async function run(): Promise<void> {
  const token = await getAuthTokenForAngularRobotApp();
  // Create authenticated Github client.
  const client = new Octokit({auth: token});

  const {number, owner, repo} = context.issue;

  const hasBreakingChangeLabel = await (
    await client.issues.listLabelsOnIssue({issue_number: number, owner, repo})
  ).data.find((label) => label.name === breakingChangeLabel);
  console.log('hasBreakingChangeLabel', hasBreakingChangeLabel);

  const hasBreakingChangeCommit = (
    await client.paginate(client.pulls.listCommits, {owner, pull_number: number, repo})
  ).some((commit) => {
    return parseCommitMessage(commit.commit.message).breakingChanges.length > 0;
  });

  if (hasBreakingChangeCommit && !hasBreakingChangeLabel) {
    await client.issues.addLabels({
      repo,
      owner,
      issue_number: number,
      labels: [breakingChangeLabel],
    });
    console.log(`Added ${breakingChangeLabel} label to PR #${number}`);
  }
  if (!hasBreakingChangeCommit && hasBreakingChangeLabel) {
    await client.issues.removeLabel({
      repo,
      owner,
      issue_number: number,
      name: breakingChangeLabel,
    });
    console.log(`Removed ${breakingChangeLabel} label from PR #${number}`);
  }
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  run();
} else {
  core.warning(
    'Automatic labeling was skipped as this action is only meant to run ' +
      'in repos belonging to the Angular organization.',
  );
}
