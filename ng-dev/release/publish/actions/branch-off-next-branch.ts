/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {green, Log, yellow} from '../../../utils/logging';
import {workspaceRelativePackageJsonPath} from '../../../utils/constants';
import {semverInc} from '../../../utils/semver';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../../notes/release-notes';
import {
  computeNewPrereleaseVersionForNext,
  getReleaseNotesCompareVersionForNext,
} from '../../versioning/next-prerelease-version';
import {ReleaseAction} from '../actions';
import {
  getCommitMessageForExceptionalNextVersionBump,
  getReleaseNoteCherryPickCommitMessage,
} from '../commit-message';

/**
 * Base action that can be used to move the next release-train into the feature-freeze or
 * release-candidate phase. This means that a new version branch is created from the next
 * branch, and a new pre-release (either RC or another `next`) is cut indicating the new phase.
 */
export abstract class BranchOffNextBranchBaseAction extends ReleaseAction {
  /**
   * Phase which the release-train currently in the `next` phase will move into.
   *
   * Note that we only allow for a next version to branch into feature-freeze or
   * directly into the release-candidate phase. A stable version cannot be released
   * without release-candidate.
   */
  abstract newPhaseName: 'feature-freeze' | 'release-candidate';

  override async getDescription() {
    const {branchName} = this.active.next;
    const newVersion = await this._computeNewVersion();
    return `Move the "${branchName}" branch into ${this.newPhaseName} phase (v${newVersion}).`;
  }

  override async perform() {
    const nextBranchName = this.active.next.branchName;
    const compareVersionForReleaseNotes = await getReleaseNotesCompareVersionForNext(
      this.active,
      this.config,
    );
    const newVersion = await this._computeNewVersion();
    const newBranch = `${newVersion.major}.${newVersion.minor}.x`;
    const beforeStagingSha = await this.getLatestCommitOfBranch(nextBranchName);

    // Verify the current next branch has a passing status, before we branch off.
    await this.assertPassingGithubStatus(beforeStagingSha, nextBranchName);

    // Branch-off the next branch into a new version branch.
    await this._createNewVersionBranchFromNext(newBranch);

    // Stage the new version for the newly created branch, and push changes to a
    // fork in order to create a staging pull request. Note that we re-use the newly
    // created branch instead of re-fetching from the upstream.
    const {pullRequest, releaseNotes, builtPackagesWithInfo} =
      await this.stageVersionForBranchAndCreatePullRequest(
        newVersion,
        compareVersionForReleaseNotes,
        newBranch,
      );

    // Wait for the staging PR to be merged. Then build and publish the feature-freeze next
    // pre-release. Finally, cherry-pick the release notes into the next branch in combination
    // with bumping the version to the next minor too.
    await this.waitForPullRequestToBeMerged(pullRequest);
    await this.publish(builtPackagesWithInfo, releaseNotes, beforeStagingSha, newBranch, 'next');
    await this._createNextBranchUpdatePullRequest(releaseNotes, newVersion);
  }

  /** Computes the new version for the release-train being branched-off. */
  private async _computeNewVersion() {
    if (this.newPhaseName === 'feature-freeze') {
      return computeNewPrereleaseVersionForNext(this.active, this.config);
    } else {
      return semverInc(this.active.next.version, 'prerelease', 'rc');
    }
  }

  /** Creates a new version branch from the next branch. */
  private async _createNewVersionBranchFromNext(newBranch: string) {
    const {branchName: nextBranch} = this.active.next;
    await this.checkoutUpstreamBranch(nextBranch);
    await this.createLocalBranchFromHead(newBranch);
    await this.pushHeadToRemoteBranch(newBranch);
    Log.info(green(`  ✓   Version branch "${newBranch}" created.`));
  }

  /**
   * Creates a pull request for the next branch that bumps the version to the next
   * minor, and cherry-picks the changelog for the newly branched-off release-candidate
   * or feature-freeze version.
   */
  private async _createNextBranchUpdatePullRequest(
    releaseNotes: ReleaseNotes,
    newVersion: semver.SemVer,
  ) {
    const {branchName: nextBranch, version} = this.active.next;
    // We increase the version for the next branch to the next minor. The team can decide
    // later if they want next to be a major through the `Configure Next as Major` release action.
    const newNextVersion = semver.parse(`${version.major}.${version.minor + 1}.0-next.0`)!;
    const bumpCommitMessage = getCommitMessageForExceptionalNextVersionBump(newNextVersion);

    await this.checkoutUpstreamBranch(nextBranch);
    await this.updateProjectVersion(newNextVersion);

    // Create an individual commit for the next version bump. The changelog should go into
    // a separate commit that makes it clear where the changelog is cherry-picked from.
    await this.createCommit(bumpCommitMessage, [workspaceRelativePackageJsonPath]);

    await this.prependReleaseNotesToChangelog(releaseNotes);

    const commitMessage = getReleaseNoteCherryPickCommitMessage(releaseNotes.version);

    await this.createCommit(commitMessage, [workspaceRelativeChangelogPath]);

    let nextPullRequestMessage =
      `The previous "next" release-train has moved into the ` +
      `${this.newPhaseName} phase. This PR updates the next branch to the subsequent ` +
      `release-train.\n\nAlso this PR cherry-picks the changelog for ` +
      `v${newVersion} into the ${nextBranch} branch so that the changelog is up to date.`;

    const nextUpdatePullRequest = await this.pushChangesToForkAndCreatePullRequest(
      nextBranch,
      `next-release-train-${newNextVersion}`,
      `Update next branch to reflect new release-train "v${newNextVersion}".`,
      nextPullRequestMessage,
    );

    Log.info(green(`  ✓   Pull request for updating the "${nextBranch}" branch has been created.`));
    Log.info(yellow(`      Please ask team members to review: ${nextUpdatePullRequest.url}.`));
  }
}
