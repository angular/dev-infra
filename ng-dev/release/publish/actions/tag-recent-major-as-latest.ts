/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {ReleaseConfig} from '../../config/index.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {fetchProjectNpmPackageInfo} from '../../versioning/npm-registry.js';
import {ReleaseAction} from '../actions.js';
import {ExternalCommands} from '../external-commands.js';
import {getReleaseTagForVersion} from '../../versioning/version-tags.js';

/**
 * Release action that tags the recently published major as latest within the NPM
 * registry. Major versions are published to the `next` NPM dist tag initially and
 * can be re-tagged to the `latest` NPM dist tag. This allows caretakers to make major
 * releases available at the same time. e.g. Framework, Tooling and Components
 * are able to publish v12 to `@latest` at the same time. This wouldn't be possible if
 * we directly publish to `@latest` because Tooling and Components needs to wait
 * for the major framework release to be available on NPM.
 * @see {CutStableAction#perform} for more details.
 */
export class TagRecentMajorAsLatest extends ReleaseAction {
  override async getDescription() {
    return `Retag recently published major v${this.active.latest.version} as "latest" in NPM.`;
  }

  override async perform() {
    await this.updateGithubReleaseEntryToStable(this.active.latest.version);
    await this.checkoutUpstreamBranch(this.active.latest.branchName);
    await this.installDependenciesForCurrentBranch();
    await ExternalCommands.invokeSetNpmDist(this.projectDir, 'latest', this.active.latest.version);
  }

  /**
   * Updates the Github release entry for the specified version to show
   * it as stable release, compared to it being shown as a pre-release.
   */
  async updateGithubReleaseEntryToStable(version: semver.SemVer) {
    const releaseTagName = getReleaseTagForVersion(version);
    const {data: releaseInfo} = await this.git.github.repos.getReleaseByTag({
      ...this.git.remoteParams,
      tag: releaseTagName,
    });

    await this.git.github.repos.updateRelease({
      ...this.git.remoteParams,
      release_id: releaseInfo.id,
      prerelease: false,
    });
  }

  static override async isActive({latest}: ActiveReleaseTrains, config: ReleaseConfig) {
    // If the latest release-train does currently not have a major version as version. e.g.
    // the latest branch is `10.0.x` with the version being `10.0.2`. In such cases, a major
    // has not been released recently, and this action should never become active.
    if (latest.version.minor !== 0 || latest.version.patch !== 0) {
      return false;
    }

    const packageInfo = await fetchProjectNpmPackageInfo(config);
    const npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
    // This action only becomes active if a major just has been released recently, but is
    // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
    // re-tagging if the current `@latest` in NPM is the previous major version.
    return npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1;
  }
}
