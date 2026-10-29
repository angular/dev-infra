/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import githubMacros from '../../../utils/git/github-macros.js';
import {assertValidCaretakerConfig, NgDevConfig} from '../../../utils/config.js';
import {
  fetchPullRequestCommentsFromGithub,
  PullRequestFromGithub,
  PullRequestCommentsFromGithub,
} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';
import {requiresLabels} from '../labels/index.js';
import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {getGsyncConfig, PullRequestFiles} from './assert-isolated-separate-files.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const enforceTestedValidation = createPullRequestValidation(
  {name: 'assertEnforceTested', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  async assert(
    pullRequest: PullRequestFromGithub,
    gitClient: AuthenticatedGitClient,
    config?: NgDevConfig,
  ) {
    if (!(await pullRequestRequiresTGP(pullRequest, gitClient, config))) {
      return;
    }

    const comments = await PullRequestComments.create(
      gitClient,
      pullRequest.number,
    ).loadPullRequestComments();

    const latestCommit = pullRequest.commits.nodes[pullRequest.commits.nodes.length - 1]?.commit;
    const latestCommitDate =
      latestCommit?.pushedDate ?? latestCommit?.committedDate ?? latestCommit?.authoredDate;

    if (await pullRequestHasValidTestedComment(comments, gitClient, latestCommitDate)) {
      return;
    }

    // TODO(jessicajaniuk): Add the actual validation that a TGP has been run.

    throw this._createError(
      `Pull Request requires a TGP and does not have one. Either run a TGP or specify the PR is fully tested by adding a comment with "TESTED=[reason]".`,
    );
  }
}

/**
 * Checks the list of labels for the `requires: TGP` label, or whether the PR modifies
 * separate-sync files (e.g. `packages/core/primitives/**`) when label application was skipped.
 */
async function pullRequestRequiresTGP(
  pullRequest: PullRequestFromGithub,
  gitClient: AuthenticatedGitClient,
  config?: NgDevConfig,
): Promise<boolean> {
  if (pullRequest.labels.nodes.some(({name}) => name === requiresLabels['REQUIRES_TGP'].name)) {
    return true;
  }
  if (config) {
    try {
      assertValidCaretakerConfig(config);
      const g3SyncConfigWithMatchers = await getGsyncConfig(config.caretaker, gitClient);
      if (g3SyncConfigWithMatchers !== null) {
        return await PullRequestFiles.create(
          gitClient,
          pullRequest.number,
          g3SyncConfigWithMatchers.config,
        ).pullRequestHasSeparateFiles();
      }
    } catch {}
  }
  return false;
}

export class PullRequestComments {
  constructor(
    private git: AuthenticatedGitClient,
    private prNumber: number,
  ) {}
  /**
   * Loads the files from a given pull request.
   */
  async loadPullRequestComments(): Promise<PullRequestCommentsFromGithub[]> {
    return (await fetchPullRequestCommentsFromGithub(this.git, this.prNumber)) ?? [];
  }

  static create(git: AuthenticatedGitClient, prNumber: number) {
    return new PullRequestComments(git, prNumber);
  }
}

/**
 * Checks for `TESTED=[reason]` comment on a current commit sha from a google organization member
 */
export async function pullRequestHasValidTestedComment(
  comments: PullRequestCommentsFromGithub[],
  gitClient: AuthenticatedGitClient,
  latestCommitDate?: string,
): Promise<boolean> {
  for (const comment of comments) {
    const {bodyText, author} = comment;
    if (
      latestCommitDate &&
      (!comment.createdAt || !(Date.parse(comment.createdAt) >= Date.parse(latestCommitDate)))
    ) {
      continue;
    }
    if (
      bodyText.startsWith(`TESTED=`) &&
      author &&
      (await githubMacros.isGooglerOrgMember(gitClient.github, author.login))
    ) {
      return true;
    }
  }
  return false;
}
