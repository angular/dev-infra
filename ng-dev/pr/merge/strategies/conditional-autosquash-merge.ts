/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../../utils/git/authenticated-git-client.js';
import {GithubApiMergeStrategyConfig} from '../../config/index.js';
import {PullRequest} from '../pull-request.js';

import {AutosquashMergeStrategy} from './autosquash-merge.js';
import {GithubApiMergeStrategy} from './api-merge.js';
import {MergeStrategy} from './strategy.js';

/**
 * Merge strategy that conditionally uses autosquash or the Github API merge.
 * If a pull request contains fixup or squash commits, the autosquash strategy
 * will be used. Otherwise, the Github API merge strategy will be used.
 */
export class ConditionalAutosquashMergeStrategy extends MergeStrategy {
  private readonly githubApiMergeStrategy: GithubApiMergeStrategy;

  constructor(
    git: AuthenticatedGitClient,
    private config: GithubApiMergeStrategyConfig,
  ) {
    super(git);
    this.githubApiMergeStrategy = new GithubApiMergeStrategy(this.git, this.config);
  }

  override async merge(pullRequest: PullRequest): Promise<void> {
    const mergeAction = this.githubApiMergeStrategy.getMergeActionFromPullRequest(pullRequest);

    // Squash and Merge will create a single commit message and thus we can use the API to merge.
    return mergeAction === 'rebase' && (await this.hasFixupOrSquashCommits(pullRequest))
      ? new AutosquashMergeStrategy(this.git).merge(pullRequest)
      : this.githubApiMergeStrategy.merge(pullRequest);
  }

  /** Checks whether the pull request contains fixup or squash commits. */
  private async hasFixupOrSquashCommits(pullRequest: PullRequest): Promise<boolean> {
    const commits = await this.getPullRequestCommits(pullRequest);

    return commits.some(({parsed: {isFixup, isSquash}}) => isFixup || isSquash);
  }
}
