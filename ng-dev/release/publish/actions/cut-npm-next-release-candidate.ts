/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';
import {semverInc} from '../../../utils/semver.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {CutNpmNextPrereleaseAction} from './cut-npm-next-prerelease.js';

/**
 * Release action that allows for the NPM `@next` first release-candidate. The
 * action is only active when there is a current feature-freeze going on.
 *
 * The action will bump the pre-release version from the `-next` prerelease to
 * the first release-candidate. The action will then become inactive again as
 * additional RC pre-releases would be handled by `CutNpmNextPrereleaseAction` then.
 *
 * Additional note: There is a separate action allowing in-progress minor's to
 * go directly into the RC phase from the `next` train. See `MoveNextIntoReleaseCandidate`.
 */
export class CutNpmNextReleaseCandidateAction extends CutNpmNextPrereleaseAction {
  override async getDescription(): Promise<string> {
    return await super.getReleaseCandidateDescription();
  }

  override async getNewVersion(): Promise<semver.SemVer> {
    return semverInc(this.releaseTrain.version, 'prerelease', 'rc');
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // A NPM `@next` release-candidate can only be cut if we are in feature-freeze.
    return active.isFeatureFreeze();
  }
}
