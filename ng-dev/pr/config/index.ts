/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError, GithubConfig, NgDevConfig} from '../../utils/config.js';

/**
 * Possible merge methods supported by the Github API.
 * https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button.
 */
export type GithubApiMergeMethod = 'merge' | 'squash' | 'rebase';

/** Configuration for the Github API merge strategy. */
export interface GithubApiMergeStrategyConfig {
  /** Default method used for merging pull requests */
  default: GithubApiMergeMethod;
  /** Labels which specify a different merge method than the default. */
  labels?: {pattern: string; method: GithubApiMergeMethod}[];
}

/** Configuration for the merge script. */
export type PullRequestConfig = {
  /**
   * Configuration for the upstream remote. All of these options are optional as
   * defaults are provided by the common dev-infra github configuration.
   */
  remote?: GithubConfig;

  /** Required base commits for given branches. */
  requiredBaseCommits?: {[branchName: string]: string};

  /** List of statuses that are required before a pull request can be merged. */
  requiredStatuses?: {type: 'check' | 'status'; name: string}[];

  /**
   * Whether pull requests should be merged using the Github API. This can be enabled
   * if projects want to have their pull requests show up as `Merged` in the Github UI.
   * The downside is that fixup or squash commits no longer work as the Github API does
   * not support this.
   */
  githubApiMerge: false | GithubApiMergeStrategyConfig;

  /**
   * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
   * scopes in patch branches, no breaking changes in minor or patch changes.
   */
  targetLabelExemptScopes?: string[];

  /**
   * Optional map of validations to enable/disable, merged with the defaults from ng-dev.
   */
  validators?: PullRequestValidationConfig;

  /**
   * Whether target labeling should be disabled. Special option for repositories
   * not working with the canonical versioning and branching of Angular projects.
   *
   * Generally not recommended as Angular-owned projects are supposed to consistently
   * follow the canonical branching/versioning.
   */
  __noTargetLabeling?: boolean;
} & {
  /**
   * Whether pull requests should be merged using a conditional autosquash strategy.
   * If a pull request contains fixup or squash commits, the autosquash strategy
   * will be used. Otherwise, the Github API merge strategy will be used.
   */
  conditionalAutosquashMerge?: boolean;

  /**
   * The configuration for merging pull requests using the Github API.
   *
   * This strategy is used as a fallback for the `conditionalAutosquashMerge` strategy,
   * when a pull request does not contain any fixup or squash commits.
   *
   * This can be enabled if projects want to have their pull requests show up as
   * `Merged` in the Github UI.
   */
  githubApiMerge: GithubApiMergeStrategyConfig;
};

/** Loads and validates the merge configuration. */
export function assertValidPullRequestConfig<T extends NgDevConfig>(
  config: T & Partial<{pullRequest: PullRequestConfig}>,
): asserts config is T & {pullRequest: PullRequestConfig} {
  const errors: string[] = [];
  if (config.pullRequest === undefined) {
    throw new ConfigValidationError(
      'No pullRequest configuration found. Set the `pullRequest` configuration.',
    );
  }

  const {conditionalAutosquashMerge, githubApiMerge} = config.pullRequest;
  if (githubApiMerge === undefined) {
    errors.push('No explicit choice of merge strategy. Please set `githubApiMerge`.');
  }

  if (conditionalAutosquashMerge && !githubApiMerge) {
    errors.push(
      '`conditionalAutosquashMerge` requires a GitHub API merge strategy to inspect commit history. ' +
        'Please configure `githubApiMerge` or disable `conditionalAutosquashMerge`.',
    );
  }

  if (errors.length) {
    throw new ConfigValidationError('Invalid `pullRequest` configuration', errors);
  }
}

export interface PullRequestValidationConfig {
  [key: `assert${string}`]: boolean;
}
