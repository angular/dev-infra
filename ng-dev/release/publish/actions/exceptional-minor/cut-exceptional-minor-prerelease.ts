/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ActiveReleaseTrains} from '../../../versioning/active-release-trains.js';
import {isVersionPublishedToNpm} from '../../../versioning/npm-registry.js';
import {isFirstNextPrerelease} from '../../../versioning/prerelease-version.js';
import {CutPrereleaseBaseAction} from '../shared/cut-prerelease.js';

/**
 * Release action that allows for `-next` pre-releases of an in-progress
 * exceptional minor. The action is active when there is an exceptional minor.
 *
 * The action will bump the pre-release version to the next increment
 * and publish it to NPM. Note that it would not be tagged on NPM as `@next`.
 */
export class CutExceptionalMinorPrereleaseAction extends CutPrereleaseBaseAction {
  releaseTrain = this.active.exceptionalMinor!;

  // An exceptional minor will never be released as `@next`. The NPM next dist tag
  // will be reserved for the normal FF/RC or `next` release trains. Specifically
  // we cannot override the `@next` NPM dist tag when it already points to a more
  // recent major. This would most commonly be the case, and in the other edge-case
  // of where no NPM next release has occurred yet- arguably an exceptional minor
  // should not prevent actual pre-releases for an on-going FF/RC or the next branch.
  // Note that NPM always requires a dist-tag, so we explicitly have one dedicated
  // for exceptional minors. This tag could be deleted in the future.
  npmDistTag = 'do-not-use-exceptional-minor' as const;

  shouldUseExistingVersion = (async () => {
    // If an exceptional minor branch has just been created, the actual version
    // will not be published directly. To account for this case, based on if the
    // version is already published or not, the version is NOT incremented.
    return (
      isFirstNextPrerelease(this.releaseTrain.version) &&
      !(await isVersionPublishedToNpm(this.releaseTrain.version, this.config))
    );
  })();

  releaseNotesCompareVersion = (async () => {
    if (await this.shouldUseExistingVersion) {
      return this.active.latest.version;
    }
    return this.releaseTrain.version;
  })();

  override async getDescription(): Promise<string> {
    // Make it more obvious that this action is for an exceptional minor.
    return `Exceptional Minor: ${await super.getDescription()}`;
  }

  static override async isActive(active: ActiveReleaseTrains) {
    return active.exceptionalMinor !== null;
  }
}
