/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {promises as fs, existsSync} from 'fs';
import path, {join} from 'path';
import semver from 'semver';

import {workspaceRelativePackageJsonPath} from '../../utils/constants.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {isGithubApiError} from '../../utils/git/github.js';
import githubMacros from '../../utils/git/github-macros.js';
import {
  getFileContentsUrl,
  getListCommitsInBranchUrl,
  getRepositoryGitUrl,
} from '../../utils/git/github-urls.js';
import {green, Log} from '../../utils/logging.js';
import {Spinner} from '../../utils/spinner.js';
import {BuiltPackage, BuiltPackageWithInfo, ReleaseConfig} from '../config/index.js';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../notes/release-notes.js';
import {NpmDistTag, PackageJson} from '../versioning/index.js';
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
import {githubReleaseBodyLimit} from './constants.js';
import {ExternalCommands} from './external-commands.js';
import {promptToInitiatePullRequestMerge} from './prompt-merge.js';
import {Prompt} from '../../utils/prompt.js';
import {glob} from 'fast-glob';
import {PnpmVersioning} from './pnpm-versioning.js';
import {Commit} from '../../utils/git/octokit-types.js';

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

/** Options that can be used to control the staging of a new version. */
export interface StagingOptions {
  /**
   * As part of staging, the `package.json` can be updated before the
   * new version is set.
   * @see {ReleaseAction.updateProjectVersion}
   */
  updatePkgJsonFn?: (pkgJson: PackageJson) => void;
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

  protected pnpmVersioning = new PnpmVersioning();

  constructor(
    protected active: ActiveReleaseTrains,
    protected git: AuthenticatedGitClient,
    protected config: ReleaseConfig,
    protected projectDir: string,
  ) {}

  /**
   * Updates the version in the project top-level `package.json` file.
   *
   * @param newVersion New SemVer version to be set in the file.
   * @param additionalUpdateFn Optional update function that runs before
   *   the version update. Can be used to update other fields.
   */
  protected async updateProjectVersion(
    newVersion: semver.SemVer,
    additionalUpdateFn?: (pkgJson: PackageJson) => void,
  ) {
    const pkgJsonPath = join(this.projectDir, workspaceRelativePackageJsonPath);
    const pkgJson = JSON.parse(await fs.readFile(pkgJsonPath, 'utf8')) as {
      version: string;
      [key: string]: any;
    };
    if (additionalUpdateFn !== undefined) {
      additionalUpdateFn(pkgJson);
    }
    pkgJson.version = newVersion.format();
    // Write the `package.json` file. Note that we add a trailing new line
    // to avoid unnecessary diff. IDEs usually add a trailing new line.
    await fs.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    Log.info(green(`  ✓   Updated project version to ${pkgJson.version}`));

    if (this.config.rulesJsInteropMode && existsSync(path.join(this.projectDir, '.aspect'))) {
      await ExternalCommands.invokeBazelUpdateAspectLockFiles(this.projectDir);
    }
  }

  /*
   * Get the modified Aspect lock files if `rulesJsInteropMode` is enabled.
   */
  protected getAspectLockFiles(): string[] {
    // TODO: Remove after `rules_js` migration is complete.
    return this.config.rulesJsInteropMode
      ? glob.sync(['.aspect/**', 'pnpm-lock.yaml'], {cwd: this.projectDir})
      : [];
  }

  /** Gets the most recent commit of a specified branch. */
  protected async getLatestCommitOfBranch(branchName: string): Promise<Commit> {
    const {
      data: {commit},
    } = await this.git.github.repos.getBranch({...this.git.remoteParams, branch: branchName});
    return commit;
  }

  /**
   * Verifies that the given commit has passing all statuses.
   *
   * Upon error, a link to the branch containing the commit is printed,
   * allowing the caretaker to quickly inspect the GitHub commit status failures.
   */
  protected async assertPassingGithubStatus(commitSha: string, branchNameForError: string) {
    const {result} = await githubMacros.getCombinedChecksAndStatusesForRef(this.git.github, {
      ...this.git.remoteParams,
      ref: commitSha,
    });
    const branchCommitsUrl = getListCommitsInBranchUrl(this.git, branchNameForError);

    if (result === 'failing' || result === null) {
      Log.error(
        `  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
          'status checks. Please make sure this commit passes all checks before re-running.',
      );
      Log.error(`      Please have a look at: ${branchCommitsUrl}`);

      if (await Prompt.confirm({message: 'Do you want to ignore the Github status and proceed?'})) {
        Log.warn(
          '  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.',
        );
        return;
      }
      throw new UserAbortedReleaseActionError();
    } else if (result === 'pending') {
      Log.error(
        `  ✘   Commit "${commitSha}" still has pending github statuses that ` +
          'need to succeed before staging a release.',
      );
      Log.error(`      Please have a look at: ${branchCommitsUrl}`);
      if (await Prompt.confirm({message: 'Do you want to ignore the Github status and proceed?'})) {
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

    if (!(await Prompt.confirm({message: 'Do you want to proceed and commit the changes?'}))) {
      throw new UserAbortedReleaseActionError();
    }

    // Commit message for the release point.
    const commitMessage = getCommitMessageForRelease(newVersion);
    const filesToCommit = [
      workspaceRelativePackageJsonPath,
      workspaceRelativeChangelogPath,
      ...this.getAspectLockFiles(),
    ];

    // Create a release staging commit including changelog and version bump.
    await this.createCommit(commitMessage, filesToCommit);

    // The caretaker may have attempted to make additional changes. These changes would
    // not be captured into the release commit. The working directory should remain clean,
    // like we assume it being clean when we start the release actions.
    if (this.git.hasUncommittedChanges()) {
      Log.error('  ✘   Unrelated changes have been made as part of the changelog editing.');
      throw new FatalReleaseActionError();
    }

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
      if (isGithubApiError(e) && e.status === 404) {
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
    if (await this.pnpmVersioning.isUsingPnpm(this.projectDir)) {
      await ExternalCommands.invokePnpmInstall(this.projectDir, this.pnpmVersioning);
      return;
    }

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
    const builtPackages = await ExternalCommands.invokeReleaseBuild(
      this.projectDir,
      this.pnpmVersioning,
    );
    const releaseInfo = await ExternalCommands.invokeReleaseInfo(
      this.projectDir,
      this.pnpmVersioning,
    );

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
   * @param opts Non-mandatory options for controlling the staging, e.g.
   *   allowing for additional `package.json` modifications.
   * @returns an object capturing actions performed as part of staging.
   */
  protected async stageVersionForBranchAndCreatePullRequest(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    pullRequestTargetBranch: string,
    opts?: StagingOptions,
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

    await this.updateProjectVersion(newVersion, opts?.updatePkgJsonFn);
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
      this.pnpmVersioning,
    );

    // Verify the packages built are the correct version.
    await this._verifyPackageVersions(releaseNotes.version, builtPackagesWithInfo);

    const pullRequest = await this.pushChangesToForkAndCreatePullRequest(
      pullRequestTargetBranch,
      `release-stage-${newVersion}`,
      `Bump version to "v${newVersion}" with changelog.`,
    );

    Log.info(green('  ✓   Release staging pull request has been created.'));

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
   * @param stagingOptions Non-mandatory options for controlling the staging of
   *   the new version. e.g. allowing for additional `package.json` modifications.
   * @returns an object capturing actions performed as part of staging.
   */
  protected async checkoutBranchAndStageVersion(
    newVersion: semver.SemVer,
    compareVersionForReleaseNotes: semver.SemVer,
    stagingBranch: string,
    stagingOpts?: StagingOptions,
  ): Promise<{
    releaseNotes: ReleaseNotes;
    pullRequest: PullRequest;
    builtPackagesWithInfo: BuiltPackageWithInfo[];
    beforeStagingSha: string;
  }> {
    // Keep track of the commit where we started the staging process on. This will be used
    // later to ensure that no changes, except for the version bump have landed as part
    // of the staging time window (where the caretaker could accidentally land other stuff).
    const {sha: beforeStagingSha} = await this.getLatestCommitOfBranch(stagingBranch);

    await this.assertPassingGithubStatus(beforeStagingSha, stagingBranch);
    await this.checkoutUpstreamBranch(stagingBranch);

    const stagingInfo = await this.stageVersionForBranchAndCreatePullRequest(
      newVersion,
      compareVersionForReleaseNotes,
      stagingBranch,
      stagingOpts,
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

    await this.promptAndWaitForPullRequestMerged(pullRequest);

    return true;
  }

  /** Prompts the user for merging the pull request, and waits for it to be merged. */
  protected async promptAndWaitForPullRequestMerged(pullRequest: PullRequest): Promise<void> {
    await promptToInitiatePullRequestMerge(this.git, pullRequest);
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
   * @param showAsLatestOnGitHub Whether the version released will represent
   *   the "latest" version of the project. I.e. GitHub will show this version as "latest".
   */
  private async _createGithubReleaseForVersion(
    releaseNotes: ReleaseNotes,
    versionBumpCommitSha: string,
    isPrerelease: boolean,
    showAsLatestOnGitHub: boolean,
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
      name: releaseNotes.version.toString(),
      tag_name: tagName,
      prerelease: isPrerelease,
      make_latest: showAsLatestOnGitHub ? 'true' : 'false',
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
   * @param additionalOptions Additional options needed for publishing a release.
   */
  protected async publish(
    builtPackagesWithInfo: BuiltPackageWithInfo[],
    releaseNotes: ReleaseNotes,
    beforeStagingSha: string,
    publishBranch: string,
    npmDistTag: NpmDistTag,
    additionalOptions: {showAsLatestOnGitHub: boolean},
  ) {
    const releaseSha = await this._getAndValidateLatestCommitForPublishing(
      publishBranch,
      releaseNotes.version,
      beforeStagingSha,
    );

    // Before publishing, we want to ensure that the locally-built packages we
    // built in the staging phase have not been modified accidentally.
    await assertIntegrityOfBuiltPackages(builtPackagesWithInfo);

    // Create a Github release for the new version.
    await this._createGithubReleaseForVersion(
      releaseNotes,
      releaseSha,
      npmDistTag === 'next',
      additionalOptions.showAsLatestOnGitHub,
    );

    // Walk through all built packages and publish them to NPM.
    for (const pkg of builtPackagesWithInfo) {
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

  /**
   * Retreive the latest commit from the provided branch, and verify that it is the expected
   * release commit and is the direct child of the previous sha provided.
   *
   * The method will make one recursive attempt to check again before throwing an error if
   * any error occurs during this validation. This exists as an attempt to handle transient
   * timeouts from Github along with cases, where the Github API response does not keep up
   * with the timing from when we perform a merge to when we verify that the merged commit is
   * present in the upstream branch.
   */
  private async _getAndValidateLatestCommitForPublishing(
    branch: string,
    version: semver.SemVer,
    previousSha: string,
    isRetry = false,
  ): Promise<string> {
    try {
      const commit = await this.getLatestCommitOfBranch(branch);
      // Ensure the latest commit in the publish branch is the bump commit.
      if (!commit.commit.message.startsWith(getCommitMessageForRelease(version))) {
        /** The shortened sha of the commit for usage in the error message. */
        const sha = commit.sha.slice(0, 8);
        Log.error(`  ✘   Latest commit (${sha}) in "${branch}" branch is not a staging commit.`);
        Log.error('      Please make sure the staging pull request has been merged.');
        throw new FatalReleaseActionError();
      }

      // We only inspect the first parent as we enforce that no merge commits are used in our
      // repos, so all commits have exactly one parent.
      if (commit.parents[0].sha !== previousSha) {
        Log.error(`  ✘   Unexpected additional commits have landed while staging the release.`);
        Log.error('      Please revert the bump commit and retry, or cut a new version on top.');
        throw new FatalReleaseActionError();
      }

      return commit.sha;
    } catch (e: unknown) {
      if (isRetry) {
        throw e;
      }
      return this._getAndValidateLatestCommitForPublishing(branch, version, previousSha, true);
    }
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
