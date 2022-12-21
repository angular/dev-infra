/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {isVersionPublishedToNpm} from '../../versioning/npm-registry.js';
import {isFirstNextPrerelease} from '../../versioning/prerelease-version.js';
import {CutPrereleaseBaseAction} from './shared/cut-prerelease.js';

/**
 * Release action that allows NPM `@next` pre-releases. The action will
 * always be active and operate on the an ongoing FF/RC train, or the
 * next release-train.
 *
 * The action will bump the pre-release version to the next increment
 * and publish it to NPM along with the `@npm` dist tag.
 */
export class CutNpmNextPrereleaseAction extends CutPrereleaseBaseAction {
  releaseTrain = this.active.releaseCandidate ?? this.active.next;
  npmDistTag = 'next' as const;

  shouldUseExistingVersion = (async () => {
    // Special-case where the version in the `next` release-train is not published yet. This
    // happens when we recently branched off for feature-freeze. We already bump the version to
    // the next minor or major, but do not publish immediately. Cutting a release immediately
    // would be not helpful as there are no other changes than in the feature-freeze branch. If
    // we happen to detect this case, we stage the release as usual but do not increment the version.
    if (this.releaseTrain === this.active.next && isFirstNextPrerelease(this.active.next.version)) {
      return !(await isVersionPublishedToNpm(this.active.next.version, this.config));
    }
    return false;
  })();

  releaseNotesCompareVersion = (async () => {
    // If we happen to detect the case from above, we use the most recent patch version as base for
    // building release notes. This is better than finding the "next" version when we branched-off
    // as it also prevents us from duplicating many commits that have already landed in the FF/RC.
    // For more details see the release notes generation and commit range determination.
    if (this.releaseTrain === this.active.next && (await this.shouldUseExistingVersion)) {
      return this.active.latest.version;
    }
    return this.releaseTrain.version;
  })();

  static override async isActive(_active: ActiveReleaseTrains) {
    // Pre-releases for the `next` NPM dist tag can always be cut. A NPM next
    // release could always either occur for an in-progress FF/RCm, or `next`.
    return true;
  }
}
