/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Commit} from '../../../commit-message/parse.js';
import {ActiveReleaseTrains} from '../../../release/versioning/active-release-trains.js';
import {Log, red} from '../../../utils/logging.js';
import {PullRequestConfig} from '../../config/index.js';
import {mergeLabels} from '../labels/index.js';
import {TargetLabel, targetLabels} from '../labels/target.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the commits provided are allowed to merge to the provided target label. */
export const changesAllowForTargetLabelValidation: any = createPullRequestValidation(
  {name: 'assertChangesAllowForTargetLabel', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(
    commits: Commit[],
    targetLabel: TargetLabel,
    config: PullRequestConfig,
    releaseTrains: ActiveReleaseTrains,
    labelsOnPullRequest: string[],
  ) {
    if (labelsOnPullRequest.includes(mergeLabels.MERGE_FIX_COMMIT_MESSAGE.name)) {
      Log.debug(
        'Skipping commit message target label validation because the commit message fixup label is ' +
          'applied.',
      );
      return;
    }

    // List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
    // scopes in patch branches, no breaking changes in minor or patch changes.
    const exemptedScopes = config.targetLabelExemptScopes || [];
    // List of commits which are subject to content requirements for the target label.
    commits = commits.filter((commit) => !exemptedScopes.includes(commit.scope));
    const hasBreakingChanges = commits.some((commit) => commit.breakingChanges.length !== 0);
    const hasDeprecations = commits.some((commit) => commit.deprecations.length !== 0);
    const hasFeatureCommits = commits.some((commit) => commit.type === 'feat');
    switch (targetLabel) {
      case targetLabels.TARGET_MAJOR:
        break;
      case targetLabels.TARGET_MINOR:
        if (hasBreakingChanges) {
          throw this._createHasBreakingChangesError(targetLabel);
        }
        break;
      case targetLabels.TARGET_RC:
      case targetLabels.TARGET_LTS:
      case targetLabels.TARGET_PATCH:
        if (hasBreakingChanges) {
          throw this._createHasBreakingChangesError(targetLabel);
        }
        if (hasFeatureCommits) {
          throw this._createHasFeatureCommitsError(targetLabel);
        }
        // Deprecations should not be merged into RC, patch or LTS branches.
        // https://semver.org/#spec-item-7. Deprecations should be part of
        // minor releases, or major releases according to SemVer.
        if (hasDeprecations && !releaseTrains.isFeatureFreeze()) {
          throw this._createHasDeprecationsError(targetLabel);
        }
        break;
      default:
        Log.warn(red('WARNING: Unable to confirm all commits in the pull request are'));
        Log.warn(red(`eligible to be merged into the target branches for: ${targetLabel.name}`));
        break;
    }
  }

  private _createHasBreakingChangesError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request has ` +
      `breaking changes. Breaking changes can only be merged with the "target: major" label.`;
    return this._createError(message);
  }

  private _createHasDeprecationsError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request ` +
      `contains deprecations. Deprecations can only be merged with the "target: minor" or ` +
      `"target: major" label.`;
    return this._createError(message);
  }

  private _createHasFeatureCommitsError(label: TargetLabel) {
    const message =
      `Cannot merge into branch for "${label.name}" as the pull request has ` +
      'commits with the "feat" type. New features can only be merged with the "target: minor" ' +
      'or "target: major" label.';
    return this._createError(message);
  }
}
