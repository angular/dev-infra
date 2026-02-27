import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {Commit, parseCommitMessage} from '../../../../ng-dev/commit-message/parse.js';
import {
  actionLabels,
  managedLabels,
  targetLabels,
} from '../../../../ng-dev/pr/common/labels/index.js';

import micromatch from 'micromatch';
import {ManagedRepositories} from '../../../../ng-dev/pr/common/labels/base.js';
import {Labeling} from '../../shared/labeling.js';

/** The type of the response data for a the pull request get method on from octokit. */
type PullRequestGetData = RestEndpointMethodTypes['pulls']['get']['response']['data'];
/** A Regex matcher to match releasable branch patterns. */
const releasableBranchMatcher = /(main|\d+\.\d+\.x)/;

export class PullRequestLabeling extends Labeling {
  readonly type = 'PR';
  /** Area labels in the current repository */
  repoAreaLabels = new Set<string>();
  /** Labels currently applied to the PR. */
  labels = new Set<string>();
  /** All commits in the PR */
  commits: Commit[] = [];
  /** The pull request information from the github API. */
  pullRequestMetadata?: PullRequestGetData;
  /** The configuration for the pull request. */
  managedLabelsByPath?: {[key: string]: string | string[]};
  /** The files in the pull request. */
  pullRequestFilePaths: string[] = [];

  /** Run the action, and revoke the installation token on completion. */
  async run() {
    core.info(`Updating labels for ${this.type} #${context.issue.number}`);
    await this.commitMessageBasedLabeling();
    await this.pathBasedLabeling();
    await this.pullRequestMetadataLabeling();
  }

  /**
   * Perform labeling based on the path of the files in the pull request.
   */
  async pathBasedLabeling() {
    console.log(this.managedLabelsByPath);
    if (!this.managedLabelsByPath) {
      return;
    }

    for (const [label, paths] of Object.entries(this.managedLabelsByPath)) {
      if (
        this.pullRequestFilePaths.length > 0 &&
        micromatch(this.pullRequestFilePaths, paths as string | string[]).length > 0
      ) {
        console.log(label);
        console.log(this.labels);
        if (!this.labels.has(label)) {
          await this.addLabel(label);
        }
      }
    }
  }

  /**
   * Perform labeling based on the commit messages for the pull request.
   */
  async commitMessageBasedLabeling() {
    // Add or Remove label as appropriate for each of the supported label and commit messaage
    // combinations.
    for (const {commitCheck, name, repositories} of Object.values(managedLabels)) {
      // Only apply the logic for the repositories the Label is registered for.
      if (!repositories.includes(context.repo.repo as ManagedRepositories)) {
        continue;
      }
      const hasCommit = this.commits.some(commitCheck);
      const hasLabel = this.labels.has(name);
      core.info(`${name} | hasLabel: ${hasLabel} | hasCommit: ${hasCommit}`);

      if (hasCommit && !hasLabel) {
        await this.addLabel(name);
      }
    }

    for (const commit of this.commits) {
      const label = 'area: ' + commit.scope;
      // This validates that the commit header scope actually exists as a valid label
      // otherwise when people make mistakes with scopes in their commit headers,
      // those would be automatically turned into an area label, which would be bad.
      if (this.repoAreaLabels.has(label) && !this.labels.has(label)) {
        await this.addLabel(label);
      }
    }
  }

  /**
   * Perform labeling based on the metadata for the pull request from the Github API.
   */
  async pullRequestMetadataLabeling() {
    // If we are unable to get pull request metadata, we can shortcut and exit early.
    if (this.pullRequestMetadata === undefined) {
      return;
    }

    /** The base reference string, or target branch of the pull request. */
    const baseRef = this.pullRequestMetadata.base.ref;

    if (!releasableBranchMatcher.test(baseRef)) {
      if (this.labels.has(targetLabels.TARGET_FEATURE.name)) {
        core.info(
          `The target branch (${baseRef}) is not a releasable branch, already has "target: feature" label`,
        );
      } else {
        core.info(
          `The target branch (${baseRef}) is not a releasable branch, adding "target: feature" label`,
        );
        await this.addLabel(targetLabels.TARGET_FEATURE.name);
      }
    }

    if (this.pullRequestMetadata.draft && this.labels.has(actionLabels.ACTION_MERGE.name)) {
      core.info(`This pull request is still in draft mode, removing "action: merge" label`);
      await this.removeLabel(actionLabels.ACTION_MERGE.name);
    }
  }

  /** Initialize the current labels and commits for the PR. */
  async initialize() {
    const {number, owner, repo} = context.issue;

    // retrieve full list of area labels for the repository
    await this.git
      .paginate(this.git.issues.listLabelsForRepo, {owner, repo})
      .then((labels) =>
        labels
          .filter((l) => l.name.startsWith('area: '))
          .forEach((l) => this.repoAreaLabels.add(l.name)),
      );

    await this.git
      .paginate(this.git.pulls.listCommits, {owner, pull_number: number, repo})
      .then(
        (commits) => (this.commits = commits.map(({commit}) => parseCommitMessage(commit.message))),
      );

    await this.git.issues
      .listLabelsOnIssue({issue_number: number, owner, repo})
      .then((resp) => resp.data.forEach(({name}) => this.labels.add(name)));

    await this.git.pulls.get({owner, repo, pull_number: number}).then(({data}) => {
      this.pullRequestMetadata = data;
    });

    this.managedLabelsByPath = this.getLabelsFromInput();
    if (this.managedLabelsByPath) {
      await this.git
        .paginate(this.git.pulls.listFiles, {owner, pull_number: number, repo})
        .then((files) => this.pullRequestFilePaths.push(...files.map((file) => file.filename)));
    }
  }

  /** Retrieve the labels from the input. */
  getLabelsFromInput(): undefined | {[key: string]: string | string[]} {
    const labelsRaw = core.getInput('labels');
    if (labelsRaw) {
      let labels = JSON.parse(labelsRaw);
      if (labels && Object.keys(labels).length > 0) {
        return labels;
      }
      core.debug('Unable to parse labels provided');
    }
    core.debug('No labels provided');
    return undefined;
  }
}
