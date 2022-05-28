/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseNotes} from '../../notes/release-notes';
import {NpmDistTag} from '../../versioning';
import {ReleaseAction} from '../actions';
import {BuiltPackageWithInfo} from '../built-package-info';

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
    await this.stageVersionForBranchAndCreatePullRequest(
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
