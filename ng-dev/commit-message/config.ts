/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError} from '../utils/config.js';

/** Configuration for commit-message comands. */
export interface CommitMessageConfig {
  maxLineLength: number;
  minBodyLength: number;
  minBodyLengthTypeExcludes?: string[];
  scopes: string[];
}

/** Assert the provided config contains a `CommitMessageConfig`. */
export function assertValidCommitMessageConfig<T>(
  config: T & Partial<{commitMessage: CommitMessageConfig}>,
): asserts config is T & {commitMessage: CommitMessageConfig} {
  if (config.commitMessage === undefined) {
    throw new ConfigValidationError(`No configuration defined for "commitMessage"`);
  }
}

/** Scope requirement level to be set for each commit type. */
export enum ScopeRequirement {
  Required,
  Optional,
  Forbidden,
}

export enum ReleaseNotesLevel {
  Hidden,
  Visible,
}

/** A commit type */
export interface CommitType {
  description: string;
  name: string;
  scope: ScopeRequirement;
  releaseNotesLevel: ReleaseNotesLevel;
}

/** The valid commit types for Angular commit messages. */
export const COMMIT_TYPES: {[key: string]: CommitType} = {
  build: {
    name: 'build',
    description: 'Changes to local repository build system and tooling',
    scope: ScopeRequirement.Optional,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
  ci: {
    name: 'ci',
    description: 'Changes to CI configuration and CI specific tooling',
    scope: ScopeRequirement.Forbidden,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
  docs: {
    name: 'docs',
    description: 'Changes which exclusively affects documentation.',
    scope: ScopeRequirement.Optional,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
  feat: {
    name: 'feat',
    description: 'Creates a new feature',
    scope: ScopeRequirement.Required,
    releaseNotesLevel: ReleaseNotesLevel.Visible,
  },
  fix: {
    name: 'fix',
    description: 'Fixes a previously discovered failure/bug',
    scope: ScopeRequirement.Required,
    releaseNotesLevel: ReleaseNotesLevel.Visible,
  },
  perf: {
    name: 'perf',
    description: 'Improves performance without any change in functionality or API',
    scope: ScopeRequirement.Required,
    releaseNotesLevel: ReleaseNotesLevel.Visible,
  },
  refactor: {
    name: 'refactor',
    description: 'Refactor without any change in functionality or API (includes style changes)',
    scope: ScopeRequirement.Optional,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
  release: {
    name: 'release',
    description: 'A release point in the repository',
    scope: ScopeRequirement.Forbidden,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
  test: {
    name: 'test',
    description: "Improvements or corrections made to the project's test suite",
    scope: ScopeRequirement.Optional,
    releaseNotesLevel: ReleaseNotesLevel.Hidden,
  },
};
