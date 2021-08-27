/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {promises as fs} from 'fs';
import {join} from 'path';
import * as semver from 'semver';

import {debug, error, green, info, promptConfirm, red, warn, yellow} from '../../utils/console';
import {Spinner} from '../../utils/spinner';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {
  getFileContentsUrl,
  getListCommitsInBranchUrl,
  getRepositoryGitUrl,
} from '../../utils/git/github-urls';
import {createExperimentalSemver} from '../../utils/semver';
import {BuiltPackage, ReleaseConfig} from '../config/index';
import {ReleaseNotes} from '../notes/release-notes';
import {NpmDistTag} from '../versioning';
import {ActiveReleaseTrains} from '../versioning/active-release-trains';
import {runNpmPublish} from '../versioning/npm-publish';

import {FatalReleaseActionError, UserAbortedReleaseActionError} from './actions-error';
import {getCommitMessageForRelease, getReleaseNoteCherryPickCommitMessage} from './commit-message';
import {
  changelogPath,
  githubReleaseBodyLimit,
  packageJsonPath,
  waitForPullRequestInterval,
} from './constants';
import {invokeReleaseBuildCommand, invokeYarnInstallCommand} from './external-commands';
import {findOwnedForksOfRepoQuery} from './graphql-queries';
import {getPullRequestState} from './pull-request-state';
import {getReleaseTagForVersion} from '../versioning/version-tags';
import {GithubApiRequestError} from '../../utils/git/github';

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

  /** Cached found fork of the configured project. */
  private _cachedForkRepo: GithubRepo | null = null;

  constructor(
    protected active: ActiveReleaseTrains,
    protected git: AuthenticatedGitClient,
    protected config: ReleaseConfig,
    protected projectDir: string,
  ) {}

  /** Retrieves the version in the project top-level `package.json` file. */
  private async getProjectVersion() {
    const pkgJsonPath = join(this.projectDir, packageJsonPath);
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf8')) as {
      version: string;
      [key: string]: any;
    };
    return new semver.SemVer(pkgJson.version);
  }

  /** Updates the version in the project top-level `package.json` file. */
  protected async updateProjectVersion(newVersion: semver.SemVer) {
    const pkgJsonPath = join(this.projectDir, packageJsonPath);
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf8')) as {
      version: string;
      [key: string]: any;
    };
    pkgJson.version = newVersion.format();
    // Write the `package.json` file. Note that we add a trailing new line
    // to avoid unnecessary diff. IDEs usually add a trailing new line.
    await fs.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    info(green(`  ✓   Updated project version to ${pkgJson.version}`));
  }

  /** Gets the most recent commit of a specified branch. */
  private async _getCommitOfBranch(branchName: string): Promise<string> {
    const {
      data: {commit},
    } = await this.git.github.repos.getBranch({...this.git.remoteParams, branch: branchName});
    return commit.sha;
  }

  /** Verifies that the latest commit for the given branch is passing all statuses. */
  protected async verifyPassingGithubStatus(branchName: string) {
    const commitSha = await this._getCommitOfBranch(branchName);
    const {
      data: {state},
    } = await this.git.github.repos.getCombinedStatusForRef({
      ...this.git.remoteParams,
      ref: commitSha,
    });
    const branchCommitsUrl = getListCommitsInBranchUrl(this.git, branchName);

    if (state === 'failure') {
      error(
        red(
          `  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
            'status checks. Please make sure this commit passes all checks before re-running.',
        ),
      );
      error(`      Please have a look at: ${branchCommitsUrl}`);

      if (await promptConfirm('Do you want to ignore the Github status and proceed?')) {
        info(
          yellow(
            '  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.',
          ),
        );
        return;
      }
      throw new UserAbortedReleaseActionError();
    } else if (state === 'pending') {
      error(
        red(
          `  ✘   Commit "${commitSha}" still has pending github statuses that ` +
            'need to succeed before staging a release.',
        ),
      );
      error(red(`      Please have a look at: ${branchCommitsUrl}`));
      if (await promptConfirm('Do you want to ignore the Github status and proceed?')) {
        info(yellow('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
        return;
      }
      throw new UserAbortedReleaseActionError();
    }

    info(green('  ✓   Upstream commit is passing all github status checks.'));
  }

  /**
   * Prompts the user for potential release notes edits that need to be made. Once
   * confirmed, a new commit for the release point is created.
   */
  protected async waitForEditsAndCreateReleaseCommit(newVersion: semver.SemVer) {
    info(
      yellow(
        '  ⚠   Please review the changelog and ensure that the log contains only changes ' +
          'that apply to the public API surface. Manual changes can be made. When done, please ' +
          'proceed with the prompt below.',
      ),
    );

    if (!(await promptConfirm('Do you want to proceed and commit the changes?'))) {
      throw new UserAbortedReleaseActionError();
    }

    // Commit message for the release point.
    const commitMessage = getCommitMessageForRelease(newVersion);
    // Create a release staging commit including changelog and version bump.
    await this.createCommit(commitMessage, [packageJsonPath, changelogPath]);

    info(green(`  ✓   Created release commit for: "${newVersion}".`));
  }

  /**
   * Gets an owned fork for the configured project of the authenticated user. Aborts the
   * process with an error if no fork could be found. Also caches the determined fork
   * repository as the authenticated user cannot change during action execution.
   */
  private async _getForkOfAuthenticatedUser(): Promise<GithubRepo> {
    if (this._cachedForkRepo !== null) {
      return this._cachedForkRepo;
    }

    const {owner, name} = this.git.remoteConfig;
    const result = await this.git.github.graphql(findOwnedForksOfRepoQuery, {owner, name});
    const forks = result.repository.forks.nodes;

    if (forks.length === 0) {
      error(red('  ✘   Unable to find fork for currently authenticated user.'));
      error(red(`      Please ensure you created a fork of: ${owner}/${name}.`));
      throw new FatalReleaseActionError();
    }

    const fork = forks[0];
    return (this._cachedForkRepo = {owner: fork.owner.login, name: fork.name});
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

    info(green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
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
      debug(`Waiting for pull request #${id} to be merged.`);

      const spinner = new Spinner(`Waiting for pull request #${id} to be merged.`);
      const intervalId = setInterval(async () => {
        const prState = await getPullRequestState(this.git, id);
        if (prState === 'merged') {
          spinner.complete();
          info(green(`  ✓   Pull request #${id} has been merged.`));
          clearInterval(intervalId);
          resolve();
        } else if (prState === 'closed') {
          spinner.complete();
          warn(yellow(`  ✘   Pull request #${id} has been closed.`));
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
    const localChangelogPath = join(this.projectDir, changelogPath);
    const localChangelog = await fs.readFile(localChangelogPath, 'utf8');
    const releaseNotesEntry = await releaseNotes.getChangelogEntry();
    await fs.writeFile(localChangelogPath, `${releaseNotesEntry}\n\n${localChangelog}`);
    info(green(`  ✓   Updated the changelog to capture changes for "${releaseNotes.version}".`));
  }

  /** Checks out an upstream branch with a detached head. */
  protected async checkoutUpstreamBranch(branchName: string) {
    this.git.run(['fetch', '-q', this.git.getRepoGitUrl(), branchName]);
    this.git.run(['checkout', '-q', 'FETCH_HEAD', '--detach']);
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
    this.git.run(['commit', '-q', '--no-verify', '-m', message, ...files]);
  }

  /**
   * Stages the specified new version for the current branch and creates a pull request
   * that targets the given base branch. Assumes the staging branch is already checked-out.
   *
   * @param newVersion New version to be staged.
   * @param compareVersionForReleaseNotes Version used for comparing with the current
   *   `HEAD` in order build the release notes.
   * @param pullRequestTargetBranch Branch the pull request should target.
   * @returns an object describing the created pull request.
   */
  protected async stageVersionForBranchAndCreatePullRequest(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    pullRequestTargetBranch: string,
  ): Promise<{releaseNotes: ReleaseNotes; pullRequest: PullRequest}> {
    const releaseNotesCompareTag = getReleaseTagForVersion(compareVersionForReleaseNotes);

    // Fetch the compare tag so that commits for the release notes can be determined.
    this.git.run(['fetch', this.git.getRepoGitUrl(), `refs/tags/${releaseNotesCompareTag}`]);

    // Build release notes for commits from `<releaseNotesCompareTag>..HEAD`.
    const releaseNotes = await ReleaseNotes.forRange(newVersion, releaseNotesCompareTag, 'HEAD');

    await this.updateProjectVersion(newVersion);
    await this.prependReleaseNotesToChangelog(releaseNotes);
    await this.waitForEditsAndCreateReleaseCommit(newVersion);

    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      pullRequestTargetBranch,
      `release-stage-${newVersion}`,
      `Bump version to "v${newVersion}" with changelog.`,
    );

    info(green('  ✓   Release staging pull request has been created.'));
    info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));

    return {releaseNotes, pullRequest};
  }

  /**
   * Checks out the specified target branch, verifies its CI status and stages
   * the specified new version in order to create a pull request.
   *
   * @param newVersion New version to be staged.
   * @param compareVersionForReleaseNotes Version used for comparing with `HEAD` of
   *   the staging branch in order build the release notes.
   * @param stagingBranch Branch within the new version should be staged.
   * @returns an object describing the created pull request.
   */
  protected async checkoutBranchAndStageVersion(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    stagingBranch: string,
  ): Promise<{releaseNotes: ReleaseNotes; pullRequest: PullRequest}> {
    await this.verifyPassingGithubStatus(stagingBranch);
    await this.checkoutUpstreamBranch(stagingBranch);
    return await this.stageVersionForBranchAndCreatePullRequest(
      newVersion,
      compareVersionForReleaseNotes,
      stagingBranch,
    );
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
    await this.createCommit(commitMessage, [changelogPath]);
    info(green(`  ✓   Created changelog cherry-pick commit for: "${releaseNotes.version}".`));

    // Create a cherry-pick pull request that should be merged by the caretaker.
    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      nextBranch,
      `changelog-cherry-pick-${releaseNotes.version}`,
      commitMessage,
      `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
        `branch (${nextBranch}).`,
    );

    info(
      green(
        `  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
          'has been created.',
      ),
    );
    info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));

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
    info(green(`  ✓   Tagged v${releaseNotes.version} release upstream.`));

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
    info(green(`  ✓   Created v${releaseNotes.version} release in Github.`));
  }

  /** Gets a Github URL that resolves to the release notes in the given ref. */
  private async _getGithubChangelogUrlForRef(releaseNotes: ReleaseNotes, ref: string) {
    const baseUrl = getFileContentsUrl(this.git, ref, changelogPath);
    const urlFragment = await releaseNotes.getUrlFragmentForRelease();
    return `${baseUrl}#${urlFragment}`;
  }

  /**
   * Builds and publishes the given version in the specified branch.
   * @param releaseNotes The release notes for the version being published.
   * @param publishBranch Name of the branch that contains the new version.
   * @param npmDistTag NPM dist tag where the version should be published to.
   */
  protected async buildAndPublish(
    releaseNotes: ReleaseNotes,
    publishBranch: string,
    npmDistTag: NpmDistTag,
  ) {
    const versionBumpCommitSha = await this._getCommitOfBranch(publishBranch);

    if (!(await this._isCommitForVersionStaging(releaseNotes.version, versionBumpCommitSha))) {
      error(red(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`));
      error(red('      Please make sure the staging pull request has been merged.'));
      throw new FatalReleaseActionError();
    }

    // Checkout the publish branch and build the release packages.
    await this.checkoutUpstreamBranch(publishBranch);

    // Install the project dependencies for the publish branch, and then build the release
    // packages. Note that we do not directly call the build packages function from the release
    // config. We only want to build and publish packages that have been configured in the given
    // publish branch. e.g. consider we publish patch version and a new package has been
    // created in the `next` branch. The new package would not be part of the patch branch,
    // so we cannot build and publish it.
    await invokeYarnInstallCommand(this.projectDir);
    const builtPackages = await invokeReleaseBuildCommand();

    // Verify the packages built are the correct version.
    await this._verifyPackageVersions(releaseNotes.version, builtPackages);

    // Create a Github release for the new version.
    await this._createGithubReleaseForVersion(
      releaseNotes,
      versionBumpCommitSha,
      npmDistTag === 'next',
    );

    // Walk through all built packages and publish them to NPM.
    for (const builtPackage of builtPackages) {
      await this._publishBuiltPackageToNpm(builtPackage, npmDistTag);
    }

    info(green('  ✓   Published all packages successfully'));
  }

  /** Publishes the given built package to NPM with the specified NPM dist tag. */
  private async _publishBuiltPackageToNpm(pkg: BuiltPackage, npmDistTag: NpmDistTag) {
    debug(`Starting publish of "${pkg.name}".`);
    const spinner = new Spinner(`Publishing "${pkg.name}"`);

    try {
      await runNpmPublish(pkg.outputPath, npmDistTag, this.config.publishRegistry);
      spinner.complete();
      info(green(`  ✓   Successfully published "${pkg.name}.`));
    } catch (e) {
      spinner.complete();
      error(e);
      error(red(`  ✘   An error occurred while publishing "${pkg.name}".`));
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

  /** Verify the version of each generated package exact matches the specified version. */
  private async _verifyPackageVersions(version: semver.SemVer, packages: BuiltPackage[]) {
    /** Experimental equivalent version for packages created with the provided version. */
    const experimentalVersion = createExperimentalSemver(version);

    for (const pkg of packages) {
      const {version: packageJsonVersion} = JSON.parse(
        await fs.readFile(join(pkg.outputPath, 'package.json'), 'utf8'),
      ) as {version: string; [key: string]: any};

      const mismatchesVersion = version.compare(packageJsonVersion) !== 0;
      const mismatchesExperimental = experimentalVersion.compare(packageJsonVersion) !== 0;

      if (mismatchesExperimental && mismatchesVersion) {
        error(red('The built package version does not match the version being released.'));
        error(`  Release Version:   ${version.version} (${experimentalVersion.version})`);
        error(`  Generated Version: ${packageJsonVersion}`);
        throw new FatalReleaseActionError();
      }
    }
  }
}
