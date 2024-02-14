/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// import {firebase} from 'firebase';
import {GoogleSyncConfig} from '../../../utils/config.js';
import {G3StatsData} from '../../../utils/g3.js';
import {pullRequestHasPrimitivesFiles, PullRequestFilesFromGithub} from '../fetch-pull-request.js';
import {createPullRequestValidation, PullRequestValidation} from './validation-config.js';

/** Assert the pull request has passing enforced statuses. */
// TODO: update typings to make sure portability is properly handled for windows build.
export const isolatePrimitivesValidation = createPullRequestValidation(
  {name: 'assertIsolatePrimitives', canBeForceIgnored: true},
  () => Validation,
);

class Validation extends PullRequestValidation {
  assert(
    pullRequestFiles: string[],
    diffStats: G3StatsData | null,
    googleSyncConfig: GoogleSyncConfig | null,
  ) {
    if (googleSyncConfig === null || diffStats === null) {
      return;
    }
    const hasPrimitives = pullRequestHasPrimitivesFiles(pullRequestFiles, googleSyncConfig);

    // if has merged stuff already and hasMergedPrimitives, it's safe to merge more primitives
    if (diffStats.primitivesFiles > 0 && !hasPrimitives) {
      throw this._createError(
        `This PR cannot be merged as Shared Primitives code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    }
    if (diffStats.files > 0 && hasPrimitives) {
      throw this._createError(
        `This PR cannot be merged as Angular framework code has already been merged. ` +
          `Primitives and Framework code must be merged and synced separately. Try again after a g3sync has finished.`,
      );
    }
  }
}
