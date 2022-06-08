/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {green, Log, yellow} from '../../../utils/logging.js';
import {workspaceRelativePackageJsonPath} from '../../../utils/constants.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {ReleaseAction} from '../actions.js';
import {getCommitMessageForNextBranchMajorSwitch} from '../commit-message.js';

/**
 * Release action that configures the active next release-train to be for a major
 * version. This means that major changes can land in the next branch.
 */
export class ConfigureNextAsMajorAction extends ReleaseAction {
  private _newVersion = semver.parse(`${this.active.next.version.major + 1}.0.0-next.0`)!;

  override async getDescription() {
    const {branchName} = this.active.next;
    const newVersion = this._newVersion;
    return `Configure the "${branchName}" branch to be released as major (v${newVersion}).`;
  }

  override async perform() {
    const {branchName} = this.active.next;
    const newVersion = this._newVersion;
    const beforeStagingSha = await this.getLatestCommitOfBranch(branchName);

    await this.assertPassingGithubStatus(beforeStagingSha, branchName);
    await this.checkoutUpstreamBranch(branchName);
    await this.updateProjectVersion(newVersion);
    await this.createCommit(getCommitMessageForNextBranchMajorSwitch(newVersion), [
      workspaceRelativePackageJsonPath,
    ]);
    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      branchName,
      `switch-next-to-major-${newVersion}`,
      `Configure next branch to receive major changes for v${newVersion}`,
    );

    Log.info(green('  ✓   Next branch update pull request has been created.'));
    Log.info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
  }

  static override async isActive(active: ActiveReleaseTrains) {
    // The `next` branch can always be switched to a major version, unless it already
    // is targeting a new major. A major can contain minor changes, so we can always
    // change the target from a minor to a major.
    return !active.next.isMajor;
  }
}
