/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {promises as fs} from 'fs';
import {join} from 'path';
import semver from 'semver';

import {workspaceRelativePackageJsonPath} from '../../utils/constants.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GithubApiRequestError} from '../../utils/git/github.js';
import {
  getFileContentsUrl,
  getListCommitsInBranchUrl,
  getRepositoryGitUrl,
} from '../../utils/git/github-urls.js';
import {green, Log, yellow} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';
import {Spinner} from '../../utils/spinner.js';
import {BuiltPackage, BuiltPackageWithInfo, ReleaseConfig} from '../config/index.js';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../notes/release-notes.js';
import {NpmDistTag} from '../versioning/index.js';
import {ActiveReleaseTrains} from '../versioning/active-release-trains.js';
import {createExperimentalSemver} from '../versioning/experimental-versions.js';
import {NpmCommand} from '../versioning/npm-command.js';
import {getReleaseTagForVersion} from '../versioning/version-tags.js';
import {FatalReleaseActionError, UserAbortedReleaseActionError} from './actions-error.js';
import {
  analyzeAndExtendBuiltPackagesWithInfo,
  assertIntegrityOfBuiltPackages,
} from './built-package-info.js';
import {
  getCommitMessageForRelease,
  getReleaseNoteCherryPickCommitMessage,
} from './commit-message.js';
import {githubReleaseBodyLimit, waitForPullRequestInterval} from './constants.js';
import {ExternalCommands} from './external-commands.js';
import {getPullRequestState} from './pull-request-state.js';

/** Interface describing a Github repository. */
export interface GithubRepo {
  owner: string;
  name: string;
}

/** Interface describing a Github pull request. */
export interface PullRequest {
  /** Unique id for the pull request (i.e. the PR number). */
  id: number;
  /** URL that resolves to the pull request in Github. */
  url: string;
  /** Fork containing the head branch of this pull request. */
  fork: GithubRepo;
  /** Branch name in the fork that defines this pull request. */
  forkBranch: string;
}

/** Constructor type for instantiating a release action */
export interface ReleaseActionConstructor<T extends ReleaseAction = ReleaseAction> {
  /** Whether the release action is currently active. */
  isActive(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<boolean>;
  /** Constructs a release action. */
  new (...args: [ActiveReleaseTrains, AuthenticatedGitClient, ReleaseConfig, string]): T;
}

/**
 * Abstract base class for a release action. A release action is selectable by the caretaker
 * if active, and can perform changes for releasing, such as staging a release, bumping the
 * version, cherry-picking the changelog, branching off from the main branch. etc.
 */
export abstract class ReleaseAction {
  /** Whether the release action is currently active. */
  static isActive(_trains: ActiveReleaseTrains, _config: ReleaseConfig): Promise<boolean> {
    throw Error('Not implemented.');
  }

  /** Gets the description for a release action. */
  abstract getDescription(): Promise<string>;
  /**
   * Performs the given release action.
   * @throws {UserAbortedReleaseActionError} When the user manually aborted the action.
   * @throws {FatalReleaseActionError} When the action has been aborted due to a fatal error.
   */
  abstract perform(): Promise<void>;

  constructor(
    protected active: ActiveReleaseTrains,
    protected git: AuthenticatedGitClient,
    protected config: ReleaseConfig,
    protected projectDir: string,
  ) {}

  /** Updates the version in the project top-level `package.json` file. */
  protected async updateProjectVersion(newVersion: semver.SemVer) {
    const pkgJsonPath = join(this.projectDir, workspaceRelativePackageJsonPath);
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf8')) as {
      version: string;
      [key: string]: any;
    };
    pkgJson.version = newVersion.format();
    // Write the `package.json` file. Note that we add a trailing new line
    // to avoid unnecessary diff. IDEs usually add a trailing new line.
    await fs.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    Log.info(green(`  ✓   Updated project version to ${pkgJson.version}`));
  }

  /** Gets the most recent commit of a specified branch. */
  protected async getLatestCommitOfBranch(branchName: string): Promise<string> {
    const {
      data: {commit},
    } = await this.git.github.repos.getBranch({...this.git.remoteParams, branch: branchName});
    return commit.sha;
  }

  /** Checks whether the given revision is ahead to the base by the specified amount. */
  private async _isRevisionAheadOfBase(
    baseRevision: string,
    targetRevision: string,
    expectedAheadCount: number,
  ) {
    const {
      data: {ahead_by, status},
    } = await this.git.github.repos.compareCommits({
      ...this.git.remoteParams,
      base: baseRevision,
      head: targetRevision,
    });

    return status === 'ahead' && ahead_by === expectedAheadCount;
  }

  /**
   * Verifies that the given commit has passing all statuses.
   *
   * Upon error, a link to the branch containing the commit is printed,
   * allowing the caretaker to quickly inspect the GitHub commit status failures.
   */
  protected async assertPassingGithubStatus(commitSha: string, branchNameForError: string) {
    const {
      data: {state},
    } = await this.git.github.repos.getCombinedStatusForRef({
      ...this.git.remoteParams,
      ref: commitSha,
    });
    const branchCommitsUrl = getListCommitsInBranchUrl(this.git, branchNameForError);

    if (state === 'failure') {
      Log.error(
        `  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
          'status checks. Please make sure this commit passes all checks before re-running.',
      );
      Log.error(`      Please have a look at: ${branchCommitsUrl}`);

      if (await Prompt.confirm('Do you want to ignore the Github status and proceed?')) {
        Log.warn(
          '  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.',
        );
        return;
      }
      throw new UserAbortedReleaseActionError();
    } else if (state === 'pending') {
      Log.error(
        `  ✘   Commit "${commitSha}" still has pending github statuses that ` +
          'need to succeed before staging a release.',
      );
      Log.error(`      Please have a look at: ${branchCommitsUrl}`);
      if (await Prompt.confirm('Do you want to ignore the Github status and proceed?')) {
        Log.warn('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.');
        return;
      }
      throw new UserAbortedReleaseActionError();
    }

    Log.info(green('  ✓   Upstream commit is passing all github status checks.'));
  }

  /**
   * Prompts the user for potential release notes edits that need to be made. Once
   * confirmed, a new commit for the release point is created.
   */
  protected async waitForEditsAndCreateReleaseCommit(newVersion: semver.SemVer) {
    Log.warn(
      '  ⚠   Please review the changelog and ensure that the log contains only changes ' +
        'that apply to the public API surface.',
    );
    Log.warn('      Manual changes can be made. When done, please proceed with the prompt below.');

    if (!(await Prompt.confirm('Do you want to proceed and commit the changes?'))) {
      throw new UserAbortedReleaseActionError();
    }

    // Commit message for the release point.
    const commitMessage = getCommitMessageForRelease(newVersion);
    // Create a release staging commit including changelog and version bump.
    await this.createCommit(commitMessage, [
      workspaceRelativePackageJsonPath,
      workspaceRelativeChangelogPath,
    ]);

    Log.info(green(`  ✓   Created release commit for: "${newVersion}".`));
  }

  /**
   * Gets an owned fork for the configured project of the authenticated user. Aborts the
   * process with an error if no fork could be found.
   */
  private async _getForkOfAuthenticatedUser(): Promise<GithubRepo> {
    try {
      return this.git.getForkOfAuthenticatedUser();
    } catch {
      const {owner, name} = this.git.remoteConfig;
      Log.error('  ✘   Unable to find fork for currently authenticated user.');
      Log.error(`      Please ensure you created a fork of: ${owner}/${name}.`);
      throw new FatalReleaseActionError();
    }
  }

  /** Checks whether a given branch name is reserved in the specified repository. */
  private async _isBranchNameReservedInRepo(repo: GithubRepo, name: string): Promise<boolean> {
    try {
      await this.git.github.repos.getBranch({owner: repo.owner, repo: repo.name, branch: name});
      return true;
    } catch (e) {
      // If the error has a `status` property set to `404`, then we know that the branch
      // does not exist. Otherwise, it might be an API error that we want to report/re-throw.
      if (e instanceof GithubApiRequestError && e.status === 404) {
        return false;
      }
      throw e;
    }
  }

  /** Finds a non-reserved branch name in the repository with respect to a base name. */
  private async _findAvailableBranchName(repo: GithubRepo, baseName: string): Promise<string> {
    let currentName = baseName;
    let suffixNum = 0;
    while (await this._isBranchNameReservedInRepo(repo, currentName)) {
      suffixNum++;
      currentName = `${baseName}_${suffixNum}`;
    }
    return currentName;
  }

  /**
   * Creates a local branch from the current Git `HEAD`. Will override
   * existing branches in case of a collision.
   */
  protected async createLocalBranchFromHead(branchName: string) {
    this.git.run(['checkout', '-q', '-B', branchName]);
  }

  /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
  protected async pushHeadToRemoteBranch(branchName: string) {
    // Push the local `HEAD` to the remote branch in the configured project.
    this.git.run(['push', '-q', this.git.getRepoGitUrl(), `HEAD:refs/heads/${branchName}`]);
  }

  /**
   * Pushes the current Git `HEAD` to a fork for the configured project that is owned by
   * the authenticated user. If the specified branch name exists in the fork already, a
   * unique one will be generated based on the proposed name to avoid collisions.
   * @param proposedBranchName Proposed branch name for the fork.
   * @param trackLocalBranch Whether the fork branch should be tracked locally. i.e. whether
   *   a local branch with remote tracking should be set up.
   * @returns The fork and branch name containing the pushed changes.
   */
  private async _pushHeadToFork(
    proposedBranchName: string,
    trackLocalBranch: boolean,
  ): Promise<{fork: GithubRepo; branchName: string}> {
    const fork = await this._getForkOfAuthenticatedUser();
    // Compute a repository URL for pushing to the fork. Note that we want to respect
    // the SSH option from the dev-infra github configuration.
    const repoGitUrl = getRepositoryGitUrl(
      {...fork, useSsh: this.git.remoteConfig.useSsh},
      this.git.githubToken,
    );
    const branchName = await this._findAvailableBranchName(fork, proposedBranchName);
    const pushArgs: string[] = [];
    // If a local branch should track the remote fork branch, create a branch matching
    // the remote branch. Later with the `git push`, the remote is set for the branch.
    if (trackLocalBranch) {
      await this.createLocalBranchFromHead(branchName);
      pushArgs.push('--set-upstream');
    }
    // Push the local `HEAD` to the remote branch in the fork.
    this.git.run(['push', '-q', repoGitUrl, `HEAD:refs/heads/${branchName}`, ...pushArgs]);
    return {fork, branchName};
  }

  /**
   * Pushes changes to a fork for the configured project that is owned by the currently
   * authenticated user. A pull request is then created for the pushed changes on the
   * configured project that targets the specified target branch.
   * @returns An object describing the created pull request.
   */
  protected async pushChangesToForkAndCreatePullRequest(
    targetBranch: string,
    proposedForkBranchName: string,
    title: string,
    body?: string,
  ): Promise<PullRequest> {
    const repoSlug = `${this.git.remoteParams.owner}/${this.git.remoteParams.repo}`;
    const {fork, branchName} = await this._pushHeadToFork(proposedForkBranchName, true);
    const {data} = await this.git.github.pulls.create({
      ...this.git.remoteParams,
      head: `${fork.owner}:${branchName}`,
      base: targetBranch,
      body,
      title,
    });

    // Add labels to the newly created PR if provided in the configuration.
    if (this.config.releasePrLabels !== undefined) {
      await this.git.github.issues.addLabels({
        ...this.git.remoteParams,
        issue_number: data.number,
        labels: this.config.releasePrLabels,
      });
    }

    Log.info(green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
    return {
      id: data.number,
      url: data.html_url,
      fork,
      forkBranch: branchName,
    };
  }

  /**
   * Waits for the given pull request to be merged. Default interval for checking the Github
   * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
   * merge, the script will abort gracefully (considering a manual user abort).
   */
  protected async waitForPullRequestToBeMerged(
    {id}: PullRequest,
    interval = waitForPullRequestInterval,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      Log.debug(`Waiting for pull request #${id} to be merged.`);

      const spinner = new Spinner(`Waiting for pull request #${id} to be merged.`);
      const intervalId = setInterval(async () => {
        const prState = await getPullRequestState(this.git, id);
        if (prState === 'merged') {
          spinner.complete();
          Log.info(green(`  ✓   Pull request #${id} has been merged.`));
          clearInterval(intervalId);
          resolve();
        } else if (prState === 'closed') {
          spinner.complete();
          Log.warn(`  ✘   Pull request #${id} has been closed.`);
          clearInterval(intervalId);
          reject(new UserAbortedReleaseActionError());
        }
      }, interval);
    });
  }

  /**
   * Prepend releases notes for a version published in a given branch to the changelog in
   * the current Git `HEAD`. This is useful for cherry-picking the changelog.
   * @returns A boolean indicating whether the release notes have been prepended.
   */
  protected async prependReleaseNotesToChangelog(releaseNotes: ReleaseNotes): Promise<void> {
    await releaseNotes.prependEntryToChangelogFile();
    Log.info(
      green(`  ✓   Updated the changelog to capture changes for "${releaseNotes.version}".`),
    );
  }

  /** Checks out an upstream branch with a detached head. */
  protected async checkoutUpstreamBranch(branchName: string) {
    this.git.run(['fetch', '-q', this.git.getRepoGitUrl(), branchName]);
    this.git.run(['checkout', '-q', 'FETCH_HEAD', '--detach']);
  }

  /** Installs all Yarn dependencies in the current branch. */
  protected async installDependenciesForCurrentBranch() {
    const nodeModulesDir = join(this.projectDir, 'node_modules');
    // Note: We delete all contents of the `node_modules` first. This is necessary
    // because Yarn could preserve extraneous/outdated nested modules that will cause
    // unexpected build failures with the NodeJS Bazel `@npm` workspace generation.
    // This is a workaround for: https://github.com/yarnpkg/yarn/issues/8146. Even though
    // we might be able to fix this with Yarn 2+, it is reasonable ensuring clean node modules.
    // TODO: Remove this when we use Yarn 2+ in all Angular repositories.
    await fs.rm(nodeModulesDir, {force: true, recursive: true, maxRetries: 3});
    await ExternalCommands.invokeYarnInstall(this.projectDir);
  }

  /**
   * Creates a commit for the specified files with the given message.
   * @param message Message for the created commit
   * @param files List of project-relative file paths to be committed.
   */
  protected async createCommit(message: string, files: string[]) {
    // Note: `git add` would not be needed if the files are already known to
    // Git, but the specified files could also be newly created, and unknown.
    this.git.run(['add', ...files]);
    // Note: `--no-verify` skips the majority of commit hooks here, but there are hooks
    // like `prepare-commit-message` which still run. We have set the `HUSKY=0` environment
    // variable at the start of the publish command to ignore such hooks as well.
    this.git.run(['commit', '-q', '--no-verify', '-m', message, ...files]);
  }

  /**
   * Builds the release output for the current branch. Assumes the node modules
   * to be already installed for the current branch.
   *
   * @returns A list of built release packages.
   */
  protected async buildReleaseForCurrentBranch(): Promise<BuiltPackageWithInfo[]> {
    // Note that we do not directly call the build packages function from the release
    // config. We only want to build and publish packages that have been configured in the given
    // publish branch. e.g. consider we publish patch version and a new package has been
    // created in the `next` branch. The new package would not be part of the patch branch,
    // so we cannot build and publish it.
    const builtPackages = await ExternalCommands.invokeReleaseBuild(this.projectDir);
    const releaseInfo = await ExternalCommands.invokeReleaseInfo(this.projectDir);

    // Extend the built packages with their disk hash and NPM package information. This is
    // helpful later for verifying integrity and filtering out e.g. experimental packages.
    return analyzeAndExtendBuiltPackagesWithInfo(builtPackages, releaseInfo.npmPackages);
  }

  /**
   * Stages the specified new version for the current branch, builds the release output,
   * verifies its output and creates a pull request  that targets the given base branch.
   *
   * This method assumes the staging branch is already checked-out.
   *
   * @param newVersion New version to be staged.
   * @param compareVersionForReleaseNotes Version used for comparing with the current
   *   `HEAD` in order build the release notes.
   * @param pullRequestTargetBranch Branch the pull request should target.
   * @returns an object capturing actions performed as part of staging.
   */
  protected async stageVersionForBranchAndCreatePullRequest(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    pullRequestTargetBranch: string,
  ): Promise<{
    releaseNotes: ReleaseNotes;
    pullRequest: PullRequest;
    builtPackagesWithInfo: BuiltPackageWithInfo[];
  }> {
    const releaseNotesCompareTag = getReleaseTagForVersion(compareVersionForReleaseNotes);

    // Fetch the compare tag so that commits for the release notes can be determined.
    // We forcibly override existing local tags that are named similar as we will fetch
    // the correct tag for release notes comparison from the upstream remote.
    this.git.run([
      'fetch',
      '--force',
      this.git.getRepoGitUrl(),
      `refs/tags/${releaseNotesCompareTag}:refs/tags/${releaseNotesCompareTag}`,
    ]);

    // Build release notes for commits from `<releaseNotesCompareTag>..HEAD`.
    const releaseNotes = await ReleaseNotes.forRange(
      this.git,
      newVersion,
      releaseNotesCompareTag,
      'HEAD',
    );

    await this.updateProjectVersion(newVersion);
    await this.prependReleaseNotesToChangelog(releaseNotes);
    await this.waitForEditsAndCreateReleaseCommit(newVersion);

    // Install the project dependencies for the publish branch.
    await this.installDependenciesForCurrentBranch();

    const builtPackagesWithInfo = await this.buildReleaseForCurrentBranch();

    // Run release pre-checks (e.g. validating the release output).
    await ExternalCommands.invokeReleasePrecheck(
      this.projectDir,
      newVersion,
      builtPackagesWithInfo,
    );

    // Verify the packages built are the correct version.
    await this._verifyPackageVersions(releaseNotes.version, builtPackagesWithInfo);

    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      pullRequestTargetBranch,
      `release-stage-${newVersion}`,
      `Bump version to "v${newVersion}" with changelog.`,
    );

    Log.info(green('  ✓   Release staging pull request has been created.'));
    Log.info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));

    return {releaseNotes, pullRequest, builtPackagesWithInfo};
  }

  /**
   * Checks out the specified target branch, verifies its CI status and stages
   * the specified new version in order to create a pull request.
   *
   * @param newVersion New version to be staged.
   * @param compareVersionForReleaseNotes Version used for comparing with `HEAD` of
   *   the staging branch in order build the release notes.
   * @param stagingBranch Branch within the new version should be staged.
   * @returns an object capturing actions performed as part of staging.
   */
  protected async checkoutBranchAndStageVersion(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    stagingBranch: string,
  ): Promise<{
    releaseNotes: ReleaseNotes;
    pullRequest: PullRequest;
    builtPackagesWithInfo: BuiltPackageWithInfo[];
    beforeStagingSha: string;
  }> {
    // Keep track of the commit where we started the staging process on. This will be used
    // later to ensure that no changes, except for the version bump have landed as part
    // of the staging time window (where the caretaker could accidentally land other stuff).
    const beforeStagingSha = await this.getLatestCommitOfBranch(stagingBranch);

    await this.assertPassingGithubStatus(beforeStagingSha, stagingBranch);
    await this.checkoutUpstreamBranch(stagingBranch);

    const stagingInfo = await this.stageVersionForBranchAndCreatePullRequest(
      newVersion,
      compareVersionForReleaseNotes,
      stagingBranch,
    );

    return {
      ...stagingInfo,
      beforeStagingSha,
    };
  }

  /**
   * Cherry-picks the release notes of a version that have been pushed to a given branch
   * into the `next` primary development branch. A pull request is created for this.
   * @returns a boolean indicating successful creation of the cherry-pick pull request.
   */
  protected async cherryPickChangelogIntoNextBranch(
    releaseNotes: ReleaseNotes,
    stagingBranch: string,
  ): Promise<boolean> {
    const nextBranch = this.active.next.branchName;
    const commitMessage = getReleaseNoteCherryPickCommitMessage(releaseNotes.version);

    // Checkout the next branch.
    await this.checkoutUpstreamBranch(nextBranch);

    await this.prependReleaseNotesToChangelog(releaseNotes);

    // Create a changelog cherry-pick commit.
    await this.createCommit(commitMessage, [workspaceRelativeChangelogPath]);
    Log.info(green(`  ✓   Created changelog cherry-pick commit for: "${releaseNotes.version}".`));

    // Create a cherry-pick pull request that should be merged by the caretaker.
    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      nextBranch,
      `changelog-cherry-pick-${releaseNotes.version}`,
      commitMessage,
      `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
        `branch (${nextBranch}).`,
    );

    Log.info(
      green(
        `  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
          'has been created.',
      ),
    );
    Log.info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));

    // Wait for the Pull Request to be merged.
    await this.waitForPullRequestToBeMerged(pullRequest);

    return true;
  }

  /**
   * Creates a Github release for the specified version. The release is created
   * by tagging the version bump commit, and by creating the release entry.
   *
   * Expects the version bump commit and changelog to be available in the
   * upstream remote.
   *
   * @param releaseNotes The release notes for the version being published.
   * @param versionBumpCommitSha Commit that bumped the version. The release tag
   *   will point to this commit.
   * @param isPrerelease Whether the new version is published as a pre-release.
   */
  private async _createGithubReleaseForVersion(
    releaseNotes: ReleaseNotes,
    versionBumpCommitSha: string,
    isPrerelease: boolean,
  ) {
    const tagName = getReleaseTagForVersion(releaseNotes.version);
    await this.git.github.git.createRef({
      ...this.git.remoteParams,
      ref: `refs/tags/${tagName}`,
      sha: versionBumpCommitSha,
    });
    Log.info(green(`  ✓   Tagged v${releaseNotes.version} release upstream.`));

    let releaseBody = await releaseNotes.getGithubReleaseEntry();

    // If the release body exceeds the Github body limit, we just provide
    // a link to the changelog entry in the Github release entry.
    if (releaseBody.length > githubReleaseBodyLimit) {
      const releaseNotesUrl = await this._getGithubChangelogUrlForRef(releaseNotes, tagName);
      releaseBody =
        `Release notes are too large to be captured here. ` +
        `[View all changes here](${releaseNotesUrl}).`;
    }

    await this.git.github.repos.createRelease({
      ...this.git.remoteParams,
      name: `v${releaseNotes.version}`,
      tag_name: tagName,
      prerelease: isPrerelease,
      body: releaseBody,
    });
    Log.info(green(`  ✓   Created v${releaseNotes.version} release in Github.`));
  }

  /** Gets a Github URL that resolves to the release notes in the given ref. */
  private async _getGithubChangelogUrlForRef(releaseNotes: ReleaseNotes, ref: string) {
    const baseUrl = getFileContentsUrl(this.git, ref, workspaceRelativeChangelogPath);
    const urlFragment = await releaseNotes.getUrlFragmentForRelease();
    return `${baseUrl}#${urlFragment}`;
  }

  /**
   * Publishes the given packages to the registry and makes the releases
   * available on GitHub.
   *
   * @param builtPackagesWithInfo List of built packages that will be published.
   * @param releaseNotes The release notes for the version being published.
   * @param beforeStagingSha Commit SHA that is expected to be the most recent one after
   *   the actual version bump commit. This exists to ensure that caretakers do not land
   *   additional changes after the release output has been built locally.
   * @param publishBranch Name of the branch that contains the new version.
   * @param npmDistTag NPM dist tag where the version should be published to.
   * @param additionalOptions Additional options for building and publishing.
   */
  protected async publish(
    builtPackagesWithInfo: BuiltPackageWithInfo[],
    releaseNotes: ReleaseNotes,
    beforeStagingSha: string,
    publishBranch: string,
    npmDistTag: NpmDistTag,
    additionalOptions: {skipExperimentalPackages?: boolean} = {},
  ) {
    const {skipExperimentalPackages} = additionalOptions;
    const versionBumpCommitSha = await this.getLatestCommitOfBranch(publishBranch);

    // Ensure the latest commit in the publish branch is the bump commit.
    if (!(await this._isCommitForVersionStaging(releaseNotes.version, versionBumpCommitSha))) {
      Log.error(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`);
      Log.error('      Please make sure the staging pull request has been merged.');
      throw new FatalReleaseActionError();
    }

    // Ensure no commits have landed since we started the staging process. This would signify
    // that the locally-built release packages are not matching with the release commit on GitHub.
    // Note: We expect the version bump commit to be ahead by **one** commit. This means it's
    // the direct parent of the commit that was latest when we started the staging.
    if (!(await this._isRevisionAheadOfBase(beforeStagingSha, versionBumpCommitSha, 1))) {
      Log.error(`  ✘   Unexpected additional commits have landed while staging the release.`);
      Log.error('      Please revert the bump commit and retry, or cut a new version on top.');
      throw new FatalReleaseActionError();
    }

    // Before publishing, we want to ensure that the locally-built packages we
    // built in the staging phase have not been modified accidentally.
    await assertIntegrityOfBuiltPackages(builtPackagesWithInfo);

    // Create a Github release for the new version.
    await this._createGithubReleaseForVersion(
      releaseNotes,
      versionBumpCommitSha,
      npmDistTag === 'next',
    );

    // Walk through all built packages and publish them to NPM.
    for (const pkg of builtPackagesWithInfo) {
      if (skipExperimentalPackages && pkg.experimental) {
        Log.debug(`Skipping "${pkg.name}" as it is experimental.`);
        continue;
      }

      await this._publishBuiltPackageToNpm(pkg, npmDistTag);
    }

    Log.info(green('  ✓   Published all packages successfully'));
  }

  /** Publishes the given built package to NPM with the specified NPM dist tag. */
  private async _publishBuiltPackageToNpm(pkg: BuiltPackage, npmDistTag: NpmDistTag) {
    Log.debug(`Starting publish of "${pkg.name}".`);
    const spinner = new Spinner(`Publishing "${pkg.name}"`);

    try {
      await NpmCommand.publish(pkg.outputPath, npmDistTag, this.config.publishRegistry);
      spinner.complete();
      Log.info(green(`  ✓   Successfully published "${pkg.name}.`));
    } catch (e) {
      spinner.complete();
      Log.error(e);
      Log.error(`  ✘   An error occurred while publishing "${pkg.name}".`);
      throw new FatalReleaseActionError();
    }
  }

  /** Checks whether the given commit represents a staging commit for the specified version. */
  private async _isCommitForVersionStaging(version: semver.SemVer, commitSha: string) {
    const {data} = await this.git.github.repos.getCommit({
      ...this.git.remoteParams,
      ref: commitSha,
    });
    return data.commit.message.startsWith(getCommitMessageForRelease(version));
  }

  // TODO: Remove this check and run it as part of common release validation.
  /** Verify the version of each generated package exact matches the specified version. */
  private async _verifyPackageVersions(version: semver.SemVer, packages: BuiltPackageWithInfo[]) {
    // Experimental equivalent version for packages.
    const experimentalVersion = createExperimentalSemver(version);

    for (const pkg of packages) {
      const {version: packageJsonVersion} = JSON.parse(
        await fs.readFile(join(pkg.outputPath, 'package.json'), 'utf8'),
      ) as {version: string; [key: string]: any};

      const expectedVersion = pkg.experimental ? experimentalVersion : version;
      const mismatchesVersion = expectedVersion.compare(packageJsonVersion) !== 0;

      if (mismatchesVersion) {
        Log.error(`The built package version does not match for: ${pkg.name}.`);
        Log.error(`  Actual version:   ${packageJsonVersion}`);
        Log.error(`  Expected version: ${expectedVersion}`);
        throw new FatalReleaseActionError();
      }
    }
  }
}
