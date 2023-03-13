/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {green, Log} from '../../../../utils/logging.js';
import {workspaceRelativePackageJsonPath} from '../../../../utils/constants.js';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../../../notes/release-notes.js';
import {PullRequest} from '../../actions.js';
import {
  getCommitMessageForExceptionalNextVersionBump,
  getReleaseNoteCherryPickCommitMessage,
} from '../../commit-message.js';
import {CutNpmNextPrereleaseAction} from '../cut-npm-next-prerelease.js';
import {CutNpmNextReleaseCandidateAction} from '../cut-npm-next-release-candidate.js';
import {ActiveReleaseTrains} from '../../../versioning/active-release-trains.js';

/**
 * Base action that can be used to move the next release-train into the dedicated FF/RC
 * release-train while also cutting a release to move the train into the `feature-freeze`
 * or `release-candidate` phase.
 *
 * This means that a new version branch is created based on the next branch, and a new
 * pre-release (either RC or another `next`) is cut- indicating the new phase.
 */
export abstract class BranchOffNextBranchBaseAction extends CutNpmNextPrereleaseAction {
  /** Phase which the release-train currently in the `next` phase will move into. */
  abstract newPhaseName: 'feature-freeze' | 'release-candidate';

  // Instances of the action for cutting a NPM next pre-releases. We will re-use
  // these for determining the "new versions" and "release notes comparison version".
  // This helps avoiding duplication, especially since there are is some special logic.
  private _nextPrerelease = new CutNpmNextPrereleaseAction(
    new ActiveReleaseTrains({...this.active, releaseCandidate: null}),
    this.git,
    this.config,
    this.projectDir,
  );
  private _rcPrerelease = new CutNpmNextReleaseCandidateAction(
    new ActiveReleaseTrains({...this.active, releaseCandidate: this.active.next}),
    this.git,
    this.config,
    this.projectDir,
  );

  override async getDescription() {
    const {branchName} = this.active.next;
    const newVersion = await this._computeNewVersion();
    return `Move the "${branchName}" branch into ${this.newPhaseName} phase (v${newVersion}).`;
  }

  override async perform() {
    const nextBranchName = this.active.next.branchName;
    const compareVersionForReleaseNotes = await this._computeReleaseNoteCompareVersion();
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

    // Wait for the staging PR to be merged. Then publish the feature-freeze next pre-release. Finally,
    // cherry-pick the release notes into the next branch in combination with bumping the version to
    // the next minor too.
    await this.promptAndWaitForPullRequestMerged(pullRequest);
    await this.publish(builtPackagesWithInfo, releaseNotes, beforeStagingSha, newBranch, 'next', {
      showAsLatestOnGitHub: false,
    });

    const branchOffPullRequest = await this._createNextBranchUpdatePullRequest(
      releaseNotes,
      newVersion,
    );
    await this.promptAndWaitForPullRequestMerged(branchOffPullRequest);
  }

  /** Computes the new version for the release-train being branched-off. */
  private async _computeNewVersion(): Promise<semver.SemVer> {
    if (this.newPhaseName === 'feature-freeze') {
      return this._nextPrerelease.getNewVersion();
    } else {
      return this._rcPrerelease.getNewVersion();
    }
  }

  /** Gets the release notes compare version for the branching-off release. */
  private async _computeReleaseNoteCompareVersion(): Promise<semver.SemVer> {
    // Regardless of the new phase, the release notes compare version should
    // always be the one as if a pre-release is cut on the `next` branch.
    // We cannot rely on the `CutNpmNextReleaseCandidateAction` here because it
    // assumes a published release for the train. This is not guaranteed.
    return await this._nextPrerelease.releaseNotesCompareVersion;
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
  ): Promise<PullRequest> {
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

    return nextUpdatePullRequest;
  }
}
