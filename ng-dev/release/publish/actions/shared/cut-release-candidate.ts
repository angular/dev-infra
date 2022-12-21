/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {semverInc} from '../../../../utils/semver.js';
import {NpmDistTag} from '../../../versioning/npm-registry.js';
import {ReleaseTrain} from '../../../versioning/release-trains.js';
import {ReleaseAction} from '../../actions.js';

/**
 * Base action class for cutting a first release candidate for a release-train.
 * The version is bumped from an arbitrary `next` pre-release to `rc.0`.
 *
 * This base action can be used for cutting first release-candidate's of
 * an in-progress exceptional minor train, or for an actual feature-freeze train.
 */
export abstract class CutReleaseCandidateBaseAction extends ReleaseAction {
  abstract releaseTrain: ReleaseTrain;
  abstract npmDistTag: NpmDistTag | null;

  override async getDescription() {
    const branch = this._getBranch();
    const newVersion = this.getNewVersion();
    return `Cut a first release-candidate for the "${branch}" branch (v${newVersion}).`;
  }

  override async perform() {
    const branch = this._getBranch();
    const newVersion = this.getNewVersion();
    const compareVersionForReleaseNotes = this.getReleaseNotesCompareVersion();

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(newVersion, compareVersionForReleaseNotes, branch);

    await this.promptAndWaitForPullRequestMerged(pullRequest);
    await this.publish(
      builtPackagesWithInfo,
      releaseNotes,
      beforeStagingSha,
      branch,
      this.npmDistTag,
    );
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branch);
  }

  /** Gets the new version that will be published. */
  getNewVersion(): semver.SemVer {
    return semverInc(this.releaseTrain.version, 'prerelease', 'rc');
  }

  /** Gets the compare version for generating release notes. */
  getReleaseNotesCompareVersion(): semver.SemVer {
    return this.releaseTrain.version;
  }

  private _getBranch(): string {
    return this.releaseTrain.branchName;
  }
}
