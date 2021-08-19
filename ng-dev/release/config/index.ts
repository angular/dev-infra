/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommitFromGitLog} from '../../commit-message/parse';
import {assertNoErrors, ConfigValidationError, getConfig} from '../../utils/config';

/** Interface describing a built package. */
export interface BuiltPackage {
  /** Name of the package. */
  name: string;
  /** Path to the package output directory. */
  outputPath: string;
}

/** Configuration for staging and publishing a release. */
export interface ReleaseConfig {
  /** Registry URL used for publishing release packages. Defaults to the NPM registry. */
  publishRegistry?: string;
  /** List of NPM packages that are published as part of this project. */
  npmPackages: string[];
  /** Builds release packages and returns a list of paths pointing to the output. */
  buildPackages: (stampForRelease?: boolean) => Promise<BuiltPackage[] | null>;
  /** The list of github labels to add to the release PRs. */
  releasePrLabels?: string[];
  /** Configuration for creating release notes during publishing. */
  releaseNotes?: ReleaseNotesConfig;
}

/** Configuration for creating release notes during publishing. */
export interface ReleaseNotesConfig {
  /** Whether to prompt for and include a release title in the generated release notes. */
  useReleaseTitle?: boolean;
  /** List of commit scopes to exclude from generated release notes. */
  hiddenScopes?: string[];
  /** Optional function that can be used to categorize commits for the release notes. */
  categorizeCommit?: (commit: CommitFromGitLog) => {
    /**
     * Name of the group the commit should be displayed within. If not specified,
     * commits will be grouped based on their scope.
     */
    groupName?: string;
    /**
     * Description of the commit. This option allows consumers to incorporate additional
     * information for commits that would otherwise not be captured.
     *
     * If not specified, the commit subject is used as description. i.e. the description does
     * not include the type and scope. e.g. `fix(a): <desc>` will turn into `<desc>`.
     */
    description?: string;
  };
  /**
   * List that can be set to control the order of how groups appear in the release
   * notes. Elements in the list need to match with the groups as determined according
   * to the `commitToGroup` option.
   *
   * Each group for the release notes, will appear in the order provided in `groupOrder`
   * and any other groups will appear after these groups, sorted alphanumerically.
   */
  groupOrder?: string[];
}

/** Configuration for releases in the dev-infra configuration. */
export type DevInfraReleaseConfig = {release: ReleaseConfig};

/** Asserts that the given configuration is a valid `DevInfraReleaseConfig`. */
export function assertValidReleaseConfig<T>(
  config: T & Partial<DevInfraReleaseConfig>,
): asserts config is T & DevInfraReleaseConfig {
  // List of errors encountered validating the config.
  const errors: string[] = [];

  if (config.release === undefined) {
    throw new ConfigValidationError('No configuration provided for `release`');
  }

  if (config.release.npmPackages === undefined) {
    errors.push(`No "npmPackages" configured for releasing.`);
  }
  if (config.release.buildPackages === undefined) {
    errors.push(`No "buildPackages" function configured for releasing.`);
  }
  if (errors.length) {
    throw new ConfigValidationError('Invalid `release` configuration', errors);
  }
}
