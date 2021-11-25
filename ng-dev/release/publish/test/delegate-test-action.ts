/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as semver from 'semver';

import {ReleaseAction} from '../actions';
import {NpmDistTag} from '../../versioning';
import {ReleaseNotes} from '../../notes/release-notes';

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

  async testBuildAndPublish(
    version: semver.SemVer,
    publishBranch: string,
    distTag: NpmDistTag,
    releaseNotesCompareTag = 'HEAD',
  ) {
    const releaseNotes = await ReleaseNotes.forRange(
      this.git,
      version,
      releaseNotesCompareTag,
      'HEAD',
    );
    await this.buildAndPublish(releaseNotes, publishBranch, distTag);
  }

  async testCherryPickWithPullRequest(version: semver.SemVer, branch: string) {
    const releaseNotes = await ReleaseNotes.forRange(this.git, version, '', '');
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, branch);
  }
}
