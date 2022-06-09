/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {BuiltPackageWithInfo} from '../../config';

import {ReleaseNotes} from '../../notes/release-notes';
import {NpmDistTag} from '../../versioning';
import {ReleaseAction} from '../actions';

/**
 * Test release action that exposes protected units of the base
 * release action class. This allows us to add unit tests.
 */
export class DelegateTestAction extends ReleaseAction {
  override async getDescription() {
    return 'Test action';
  }

  override async perform() {
    throw Error('Not implemented.');
  }

  async testStagingWithBuild(
    version: semver.SemVer,
    stagingBranch: string,
    releaseNotesCompareVersion: semver.SemVer,
  ) {
    return await this.checkoutBranchAndStageVersion(
      version,
      releaseNotesCompareVersion,
      stagingBranch,
    );
  }

  async testPublish(
    builtPackagesWithInfo: BuiltPackageWithInfo[],
    version: semver.SemVer,
    publishBranch: string,
    beforeStagingSha: string,
    npmDistTag: NpmDistTag,
    releaseNotesCompareTag: string = '',
  ) {
    const releaseNotes = await ReleaseNotes.forRange(
      this.git,
      version,
      releaseNotesCompareTag,
      'HEAD',
    );
    await this.publish(
      builtPackagesWithInfo,
      releaseNotes,
      beforeStagingSha,
      publishBranch,
      npmDistTag,
    );
  }

  async testCherryPickWithPullRequest(version: semver.SemVer, branch: string) {
    const releaseNotes = await ReleaseNotes.forRange(this.git, version, '', '');
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branch);
  }
}
