/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit} from '../../../commit-message/parse.js';
import {managedLabels} from '../labels/index.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request is properly denoted if it contains breaking changes. */
export const breakingChangeInfoValidation = createPullRequestValidation(
  {name: 'assertPending', canBeForceIgnored: false},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(commits: Commit[], labels: string[]) {
    // Whether the PR has a label noting a breaking change.
    const hasLabel = labels.includes(managedLabels.DETECTED_BREAKING_CHANGE.name);
    // Whether the PR has at least one commit which notes a breaking change.
    const hasCommit = commits.some((commit) => commit.breakingChanges.length !== 0);

    if (!hasLabel && hasCommit) {
      throw this._createMissingBreakingChangeLabelError();
    }

    if (hasLabel && !hasCommit) {
      throw this._createMissingBreakingChangeCommitError();
    }
  }

  private _createMissingBreakingChangeLabelError() {
    const message =
      `Pull Request has at least one commit containing a breaking change note, ` +
      `but does not have a breaking change label. Make sure to apply the ` +
      `following label: ${managedLabels.DETECTED_BREAKING_CHANGE.name}`;
    return this._createError(message);
  }

  private _createMissingBreakingChangeCommitError() {
    const message =
      'Pull Request has a breaking change label, but does not contain any commits with ' +
      'breaking change notes (i.e. commits do not have a `BREAKING CHANGE: <..>` section).';
    return this._createError(message);
  }
}
