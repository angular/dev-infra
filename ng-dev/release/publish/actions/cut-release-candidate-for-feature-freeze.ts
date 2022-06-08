/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {semverInc} from '../../../utils/semver.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {ReleaseAction} from '../actions.js';

/**
 * Cuts the first release candidate for a release-train currently in the
 * feature-freeze phase. The version is bumped from `next` to `rc.0`.
 */
export class CutReleaseCandidateForFeatureFreezeAction extends ReleaseAction {
  private _newVersion = semverInc(this.active.releaseCandidate!.version, 'prerelease', 'rc');

  override async getDescription() {
    const newVersion = this._newVersion;
    const branchName = this.active.releaseCandidate!.branchName;
    return `Cut a first release-candidate for the "${branchName}" feature-freeze branch (v${newVersion}).`;
  }

  override async perform() {
    const {branchName} = this.active.releaseCandidate!;
    const newVersion = this._newVersion;
    const compareVersionForReleaseNotes = this.active.releaseCandidate!.version;

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(
        newVersion,
        compareVersionForReleaseNotes,
        branchName,
      );

    await this.waitForPullRequestToBeMerged(pullRequest);
    await this.publish(builtPackagesWithInfo, releaseNotes, beforeStagingSha, branchName, 'next');
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // A release-candidate can be cut for an active release-train currently
    // in the feature-freeze phase.
    return (
      active.releaseCandidate !== null && active.releaseCandidate.version.prerelease[0] === 'next'
    );
  }
}
