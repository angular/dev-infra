/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getConfig, NgDevConfig} from '../../utils/config';

import {GithubApiMergeStrategyConfig} from './strategies/api-merge';

/**
 * Possible merge methods supported by the Github API.
 * https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button.
 */
export type GithubApiMergeMethod = 'merge'|'squash'|'rebase';

/**
 * Target labels represent Github pull requests labels. These labels instruct the merge
 * script into which branches a given pull request should be merged to.
 */
export interface TargetLabel {
  /** Pattern that matches the given target label. */
  pattern: RegExp|string;
  /**
   * List of branches a pull request with this target label should be merged into.
   * Can also be wrapped in a function that accepts the target branch specified in the
   * Github Web UI. This is useful for supporting labels like `target: development-branch`.
   */
  branches: string[]|((githubTargetBranch: string) => string[]);
}

/** Describes the remote used for merging pull requests. */
export interface MergeRemote {
  /** Owner name of the repository. */
  owner: string;
  /** Name of the repository. */
  name: string;
  /** Whether SSH should be used for merging pull requests. */
  useSsh?: boolean
}

/**
 * Configuration for the merge script with all remote options specified. The
 * default `MergeConfig` has does not require any of these options as defaults
 * are provided by the common dev-infra github configuration.
 */
export type MergeConfigWithRemote = MergeConfig&{remote: MergeRemote};

/** Configuration for the merge script. */
export interface MergeConfig {
  /**
   * Configuration for the upstream remote. All of these options are optional as
   * defaults are provided by the common dev-infra github configuration.
   */
  remote?: Partial<MergeRemote>;
  /** List of target labels. */
  labels: TargetLabel[];
  /** Required base commits for given branches. */
  requiredBaseCommits?: {[branchName: string]: string};
  /** Pattern that matches labels which imply a signed CLA. */
  claSignedLabel: string|RegExp;
  /** Pattern that matches labels which imply a merge ready pull request. */
  mergeReadyLabel: string|RegExp;
  /** Label which can be applied to fixup commit messages in the merge script. */
  commitMessageFixupLabel: string|RegExp;
  /**
   * Whether pull requests should be merged using the Github API. This can be enabled
   * if projects want to have their pull requests show up as `Merged` in the Github UI.
   * The downside is that fixup or squash commits no longer work as the Github API does
   * not support this.
   */
  githubApiMerge: false|GithubApiMergeStrategyConfig;
}

/**
 * Configuration of the merge script in the dev-infra configuration. Note that the
 * merge configuration is retrieved lazily as usually these configurations rely
 * on branch name computations. We don't want to run these immediately whenever
 * the dev-infra configuration is loaded as that could slow-down other commands.
 */
export type DevInfraMergeConfig = NgDevConfig<{'merge': () => MergeConfig}>;

/** Loads and validates the merge configuration. */
export function loadAndValidateConfig(): {config?: MergeConfigWithRemote, errors?: string[]} {
  const config: Partial<DevInfraMergeConfig> = getConfig();

  if (config.merge === undefined) {
    return {
      errors: ['No merge configuration found. Set the `merge` configuration.']
    }
  }

  if (typeof config.merge !== 'function') {
    return {
      errors: ['Expected merge configuration to be defined lazily through a function.']
    }
  }

  const mergeConfig = config.merge();
  const errors = validateMergeConfig(mergeConfig);

  if (errors.length) {
    return {errors};
  }

  if (mergeConfig.remote) {
    mergeConfig.remote = {...config.github, ...mergeConfig.remote};
  } else {
    mergeConfig.remote = config.github;
  }

  // We always set the `remote` option, so we can safely cast the
  // config to `MergeConfigWithRemote`.
  return {config: mergeConfig as MergeConfigWithRemote};
}

/** Validates the specified configuration. Returns a list of failure messages. */
function validateMergeConfig(config: Partial<MergeConfig>): string[] {
  const errors: string[] = [];
  if (!config.labels) {
    errors.push('No label configuration.');
  } else if (!Array.isArray(config.labels)) {
    errors.push('Label configuration needs to be an array.');
  }
  if (!config.claSignedLabel) {
    errors.push('No CLA signed label configured.');
  }
  if (!config.mergeReadyLabel) {
    errors.push('No merge ready label configured.');
  }
  if (config.githubApiMerge === undefined) {
    errors.push('No explicit choice of merge strategy. Please set `githubApiMerge`.');
  }
  return errors;
}
