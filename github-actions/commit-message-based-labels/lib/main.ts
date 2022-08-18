import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {Commit, parseCommitMessage} from '../../../ng-dev/commit-message/parse.js';
import {COMMIT_TYPES} from '../../../ng-dev/commit-message/config.js';
import {breakingChangeLabel, deprecationLabel} from '../../../ng-dev/pr/config/index.js';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';

/** List of supported label and commit message attribute combinations. */
const supportedLabels = [
  [breakingChangeLabel, 'breakingChanges'],
  [deprecationLabel, 'deprecations'],
] as const;

/** Label for docs changes. */
const compDocsLabel = 'comp: docs';

class CommitMessageBasedLabelManager {
  /** Run the commit message based labelling process. */
  static run = async () => {
    const token = await getAuthTokenFor(ANGULAR_ROBOT);
    const git = new Octokit({auth: token});
    try {
      const inst = new this(git);
      await inst.run();
    } finally {
      await revokeActiveInstallationToken(git);
    }
  };

  /** Labels currently applied to the PR. */
  labels = new Set<string>();
  /** Parsed commit message for every commit on the PR. */
  commits = new Set<Commit>();

  private constructor(private git: Octokit) {}

  /** Run the action, and revoke the installation token on completion. */
  async run() {
    // Initialize the labels and commits before performing the action.
    await this.initialize();
    core.info(`PR #${context.issue.number}`);

    // Add or Remove label as appropriate for each of the supported label and commit messaage
    // combinations.
    for (const [label, commitProperty] of supportedLabels) {
      const hasCommit = [...this.commits].some((commit) => commit[commitProperty].length > 0);
      const hasLabel = this.labels.has(label);
      core.info(`${commitProperty} | hasLabel: ${hasLabel} | hasCommit: ${hasCommit}`);

      if (hasCommit && !hasLabel) {
        await this.addLabel(label);
      }
      if (!hasCommit && hasLabel) {
        await this.removeLabel(label);
      }
    }

    // Add 'comp: docs' label for changes which contain a docs commit.
    if (!this.labels.has(compDocsLabel)) {
      for (const commit of this.commits) {
        if (commit.type === COMMIT_TYPES['docs'].name) {
          await this.addLabel(compDocsLabel);
          break;
        }
      }
    }
  }

  /** Add the provided label to the pull request. */
  async addLabel(label: string) {
    const {number: issue_number, owner, repo} = context.issue;
    try {
      await this.git.issues.addLabels({repo, owner, issue_number, labels: [label]});
      core.info(`Added ${label} label to PR #${issue_number}`);
      this.labels.add(label);
    } catch (err) {
      core.error(`Failed to add ${label} label to PR #${issue_number}`);
      core.debug(err as string);
    }
  }

  /** Remove the provided label from the pull request. */
  async removeLabel(name: string) {
    const {number: issue_number, owner, repo} = context.issue;
    try {
      await this.git.issues.removeLabel({repo, owner, issue_number, name});
      core.info(`Added ${name} label to PR #${issue_number}`);
      this.labels.delete(name);
    } catch (err) {
      core.error(`Failed to add ${name} label to PR #${issue_number}`);
      core.debug(err as string);
    }
  }

  /** Initialize the current labels and commits for the PR. */
  async initialize() {
    const {number, owner, repo} = context.issue;

    await this.git
      .paginate(this.git.pulls.listCommits, {owner, pull_number: number, repo})
      .then((commits) =>
        commits.forEach(({commit}) => this.commits.add(parseCommitMessage(commit.message))),
      );

    await this.git.issues
      .listLabelsOnIssue({issue_number: number, owner, repo})
      .then((resp) => resp.data.forEach(({name}) => this.labels.add(name)));
  }
}

// Only run if the action is executed in a repository within the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  CommitMessageBasedLabelManager.run().catch((e: Error) => {
    core.error(e);
    core.setFailed(e.message);
  });
} else {
  core.warning(
    'Automatic labeling was skipped as this action is only meant to run ' +
      'in repos belonging to the Angular organization.',
  );
}
