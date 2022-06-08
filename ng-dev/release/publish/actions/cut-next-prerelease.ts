/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {semverInc} from '../../../utils/semver.js';
import {
  computeNewPrereleaseVersionForNext,
  getReleaseNotesCompareVersionForNext,
} from '../../versioning/next-prerelease-version.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {ReleaseAction} from '../actions.js';

/**
 * Release action that cuts a prerelease for the next branch. A version in the next
 * branch can have an arbitrary amount of next pre-releases.
 */
export class CutNextPrereleaseAction extends ReleaseAction {
  /** Promise resolving with the new version if a NPM next pre-release is cut. */
  private _newVersion: Promise<semver.SemVer> = this._computeNewVersion();

  override async getDescription() {
    const {branchName} = this._getActivePrereleaseTrain();
    const newVersion = await this._newVersion;
    return `Cut a new next pre-release for the "${branchName}" branch (v${newVersion}).`;
  }

  override async perform() {
    const releaseTrain = this._getActivePrereleaseTrain();
    const {branchName} = releaseTrain;
    const newVersion = await this._newVersion;
    const compareVersionForReleaseNotes = await this._getCompareVersionForReleaseNotes();

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(
        newVersion,
        compareVersionForReleaseNotes,
        branchName,
      );

    await this.waitForPullRequestToBeMerged(pullRequest);
    await this.publish(builtPackagesWithInfo, releaseNotes, beforeStagingSha, branchName, 'next');

    // If the pre-release has been cut from a branch that is not corresponding
    // to the next release-train, cherry-pick the changelog into the primary
    // development branch (i.e. the next branch).
    if (releaseTrain !== this.active.next) {
      await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
    }
  }

  /** Gets the release train for which NPM next pre-releases should be cut. */
  private _getActivePrereleaseTrain(): ReleaseTrain {
    return this.active.releaseCandidate ?? this.active.next;
  }

  /** Gets the new pre-release version for this release action. */
  private async _computeNewVersion(): Promise<semver.SemVer> {
    const releaseTrain = this._getActivePrereleaseTrain();
    // If a pre-release is cut for the next release-train, the new version is computed
    // with respect to special cases surfacing with FF/RC branches. Otherwise, the basic
    // pre-release increment of the version is used as new version.
    if (releaseTrain === this.active.next) {
      return await computeNewPrereleaseVersionForNext(this.active, this.config);
    } else {
      return semverInc(releaseTrain.version, 'prerelease');
    }
  }

  /** Gets the compare version for building release notes of the new pre-release.*/
  private async _getCompareVersionForReleaseNotes(): Promise<semver.SemVer> {
    const releaseTrain = this._getActivePrereleaseTrain();
    // If a pre-release is cut for the next release-train, the compare version is computed
    // with respect to special cases surfacing with FF/RC branches. Otherwise, the current
    // version from the release train is used for comparison.
    if (releaseTrain === this.active.next) {
      return await getReleaseNotesCompareVersionForNext(this.active, this.config);
    } else {
      return releaseTrain.version;
    }
  }

  static override async isActive() {
    // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
    // there is a feature-freeze/release-candidate branch, the next pre-releases are either
    // cut from such a branch, or from the actual `next` release-train branch.
    return true;
  }
}
