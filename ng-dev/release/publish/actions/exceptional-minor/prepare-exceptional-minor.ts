/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {workspaceRelativePackageJsonPath} from '../../../../utils/constants.js';
import {green, Log} from '../../../../utils/logging.js';
import {ActiveReleaseTrains} from '../../../versioning/active-release-trains.js';
import {exceptionalMinorPackageIndicator} from '../../../versioning/version-branches.js';
import {ReleaseAction} from '../../actions.js';

/**
 * Release action for initiating an exceptional minor release-train. This
 * action is active when a new major is already in-progress but another
 * minor is suddenly needed for the previous major.
 *
 * The action will create a new branch based on the existing "latest"
 * release-train. No release will be published immediately to allow for
 * changes to be made. Once changes have been made, an exceptional minor
 * can switch into the `release-candidate` phase, and then become "latest".
 *
 * More details can be found here: http://go/angular-exceptional-minor.
 */
export class PrepareExceptionalMinorAction extends ReleaseAction {
  private _patch = this.active.latest;
  private _baseBranch = this._patch.branchName;
  private _patchVersion = this._patch.version;
  private _newBranch = `${this._patchVersion.major}.${this._patchVersion.minor + 1}.x`;
  private _newVersion = semver.parse(
    `${this._patchVersion.major}.${this._patchVersion.minor + 1}.0-next.0`,
  )!;

  async getDescription(): Promise<string> {
    return `Prepare an exceptional minor based on the existing "${this._baseBranch}" branch (${this._newBranch}).`;
  }

  async perform(): Promise<void> {
    const latestBaseBranchSha = await this.getLatestCommitOfBranch(this._baseBranch);

    await this.assertPassingGithubStatus(latestBaseBranchSha, this._baseBranch);

    await this.checkoutUpstreamBranch(this._baseBranch);
    await this.createLocalBranchFromHead(this._newBranch);
    await this.updateProjectVersion(this._newVersion, (pkgJson) => {
      pkgJson[exceptionalMinorPackageIndicator] = true;
    });
    await this.createCommit(`build: prepare exceptional minor branch: ${this._newBranch}`, [
      workspaceRelativePackageJsonPath,
    ]);
    await this.pushHeadToRemoteBranch(this._newBranch);

    Log.info(green(`  ✓   Version branch "${this._newBranch}" created.`));
    Log.info(green(`      Exceptional minor release-train is now active.`));
  }

  static override async isActive(active: ActiveReleaseTrains): Promise<boolean> {
    if (active.exceptionalMinor !== null) {
      return false;
    }
    // If a FF/RC train is in-progress and it's for a major, we allow
    // for an exceptional minor.
    if (active.releaseCandidate !== null) {
      return active.releaseCandidate.isMajor;
    }
    // Otherwise if there is no FF/RC train and `next` is for a major,
    // an exceptional minor is allowed.
    return active.next.isMajor;
  }
}
