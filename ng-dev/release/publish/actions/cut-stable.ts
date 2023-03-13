/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {getLtsNpmDistTagOfMajor} from '../../versioning/long-term-support.js';
import {NpmDistTag} from '../../versioning/npm-registry.js';
import {ReleaseTrain} from '../../versioning/release-trains.js';
import {exceptionalMinorPackageIndicator} from '../../versioning/version-branches.js';
import {FatalReleaseActionError} from '../actions-error.js';
import {ReleaseAction, StagingOptions} from '../actions.js';
import {ExternalCommands} from '../external-commands.js';

/**
 * Release action that cuts a stable version for the current release-train
 * in the "release-candidate" phase.
 *
 * There are only two possible release-trains that can ever be in the RC phase.
 * This is either an exceptional-minor or the dedicated FF/RC release-train.
 */
export class CutStableAction extends ReleaseAction {
  private _train = (this.active.exceptionalMinor ?? this.active.releaseCandidate)!;
  private _branch = this._train.branchName;
  private _newVersion = this._computeNewVersion(this._train);
  private _isNewMajor = this._train.isMajor;

  override async getDescription() {
    if (this._isNewMajor) {
      return `Cut a stable release for the "${this._branch}" branch — published as \`@next\` (v${this._newVersion}).`;
    } else {
      return `Cut a stable release for the "${this._branch}" branch — published as \`@latest\` (v${this._newVersion}).`;
    }
  }

  override async perform() {
    // This should never happen, but we add a sanity check just to be sure.
    if (this._isNewMajor && this._train === this.active.exceptionalMinor) {
      throw new FatalReleaseActionError('Unexpected major release of an `exceptional-minor`.');
    }

    const branchName = this._branch;
    const newVersion = this._newVersion;

    // When cutting a new stable minor/major or an exceptional minor, we want to build the
    // notes capturing all changes that have landed in the individual `-next`/RC pre-releases.
    const compareVersionForReleaseNotes = this.active.latest.version;

    // We always remove a potential exceptional-minor indicator. If we would
    // publish a stable version of an exceptional minor here- it would leave
    // the exceptional minor train and the indicator should be removed.
    const stagingOpts: StagingOptions = {
      updatePkgJsonFn: (pkgJson) => {
        pkgJson[exceptionalMinorPackageIndicator] = undefined;
      },
    };

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(
        newVersion,
        compareVersionForReleaseNotes,
        branchName,
        stagingOpts,
      );

    await this.promptAndWaitForPullRequestMerged(pullRequest);

    await this.publish(
      builtPackagesWithInfo,
      releaseNotes,
      beforeStagingSha,
      branchName,
      this._getNpmDistTag(),
      {showAsLatestOnGitHub: true},
    );

    // If we turned an exceptional minor into the new patch, the temporary
    // NPM dist tag for the exceptional minor can be deleted. For more details
    // see the `CutExceptionalMinorPrereleaseAction` class.
    if (this._train === this.active.exceptionalMinor) {
      await ExternalCommands.invokeDeleteNpmDistTag(
        this.projectDir,
        'do-not-use-exceptional-minor',
      );
    }

    // If a new major version is published and becomes the "latest" release-train, we need
    // to set the LTS npm dist tag for the previous latest release-train (the current patch).
    if (this._isNewMajor) {
      const previousPatch = this.active.latest;
      const ltsTagForPatch = getLtsNpmDistTagOfMajor(previousPatch.version.major);

      // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
      // setting the NPM dist tag to the specified version. We do this because release NPM
      // packages could be different in the previous patch branch, and we want to set the
      // LTS tag for all packages part of the last major. It would not be possible to set the
      // NPM dist tag for new packages part of the released major, nor would it be acceptable
      // to skip the LTS tag for packages which are no longer part of the new major.
      await this.checkoutUpstreamBranch(previousPatch.branchName);
      await this.installDependenciesForCurrentBranch();

      await ExternalCommands.invokeSetNpmDist(
        this.projectDir,
        ltsTagForPatch,
        previousPatch.version,
        {
          // We do not intend to tag experimental NPM packages as LTS.
          skipExperimentalPackages: true,
        },
      );
    }

    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName);
  }

  private _getNpmDistTag(): NpmDistTag {
    // If a new major version is published, we publish to the `next` NPM dist tag temporarily.
    // We do this because for major versions, we want all main Angular projects to have their
    // new major become available at the same time. Publishing immediately to the `latest` NPM
    // dist tag could cause inconsistent versions when users install packages with `@latest`.
    // For example: Consider Angular Framework releases v12. CLI and Components would need to
    // wait for that release to complete. Once done, they can update their dependencies to point
    // to v12. Afterwards they could start the release process. In the meanwhile though, the FW
    // dependencies were already available as `@latest`, so users could end up installing v12 while
    // still having the older (but currently still latest) CLI version that is incompatible.
    // The major release can be re-tagged to `latest` through a separate release action.
    return this._isNewMajor ? 'next' : 'latest';
  }

  /** Gets the new stable version of the given release-train. */
  private _computeNewVersion({version}: ReleaseTrain): semver.SemVer {
    return semver.parse(`${version.major}.${version.minor}.${version.patch}`)!;
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // -- Notes -- :
    //   * A stable version can be cut for an active release-train currently in the
    //     release-candidate phase.
    //   * If there is an exceptional minor, **only** the exceptional minor considered
    //     because it would be problematic if an in-progress RC would suddenly take over
    //     while there is still an in-progress exceptional minor.
    //   * It is impossible to directly release from feature-freeze phase into stable.
    if (active.exceptionalMinor !== null) {
      return active.exceptionalMinor.version.prerelease[0] === 'rc';
    }
    if (active.releaseCandidate !== null) {
      return active.releaseCandidate.version.prerelease[0] === 'rc';
    }
    return false;
  }
}
