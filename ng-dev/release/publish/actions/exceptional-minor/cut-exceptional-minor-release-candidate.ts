/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {semverInc} from '../../../../utils/semver.js';
import {ActiveReleaseTrains} from '../../../versioning/active-release-trains.js';
import {CutExceptionalMinorPrereleaseAction} from './cut-exceptional-minor-prerelease.js';

/**
 * Release action that allows for the first exceptional minor release-candidate. The
 * action is only active when there is an in-progress exceptional minor that
 * is still in the `-next` pre-release phase.
 *
 * The action will bump the pre-release version from the `-next` prerelease to
 * the first release-candidate. The action will then become inactive again as
 * additional RC pre-releases would be handled by `CutExceptionalMinorPrereleaseAction`
 * then.
 */
export class CutExceptionalMinorReleaseCandidateAction extends CutExceptionalMinorPrereleaseAction {
  override async getDescription(): Promise<string> {
    // Use the RC description and make it clear that this action is for an exceptional minor.
    return `Exceptional Minor: ${await super.getReleaseCandidateDescription()}`;
  }

  override async getNewVersion(): Promise<semver.SemVer> {
    return semverInc(this.releaseTrain.version, 'prerelease', 'rc');
  }

  static override async isActive(active: ActiveReleaseTrains) {
    return (
      // If there is an exceptional minor and we are still in `-next` pre-releases,
      // the first RC pre-release can be cut.
      active.exceptionalMinor !== null && active.exceptionalMinor.version.prerelease[0] === 'next'
    );
  }
}
