/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {
  readdirSync,
  readFileSync,
  existsSync,
  writeFileSync,
  rmSync,
  mkdtempSync,
  Dirent,
} from 'fs';
import {tmpdir} from 'os';
import semver from 'semver';
import {
  ReleaseConfig,
  BuiltPackage,
  BuiltPackageWithInfo,
} from '../../../../ng-dev/release/config/index.js';
import {analyzeAndExtendBuiltPackagesWithInfo} from '../../../../ng-dev/release/publish/built-package-info.js';
import {GithubConfig, NgDevConfig} from '../../../../ng-dev/utils/config.js';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {
  ReleaseNotes,
  workspaceRelativeChangelogPath,
} from '../../../../ng-dev/release/notes/release-notes.js';
import {NpmCommand} from '../../../../ng-dev/release/versioning/npm-command.js';
import {getFileContentsUrl} from '../../../../ng-dev/utils/git/github-urls.js';
import {isGithubApiError} from '../../../../ng-dev/utils/git/github.js';
import {githubReleaseBodyLimit} from '../../../../ng-dev/release/publish/constants.js';
import {green, Log} from '../../../../ng-dev/utils/logging.js';
import {fetchLongTermSupportBranchesFromNpm} from '../../../../ng-dev/release/versioning/long-term-support.js';
import {ActiveReleaseTrains} from '../../../../ng-dev/release/versioning/active-release-trains.js';
import {NpmDistTag} from '../../../../ng-dev/release/versioning/npm-registry.js';

/** Options for configuring the PublishCiTool. */
export interface PublishCiToolOptions {
  /** The directory containing the pre-built packages to be published. */
  builtPackagesDir: string;
  /** The expected Git SHA of the release commit to verify against HEAD. */
  expectedSha: string;
  /** Whether to run in dry-run mode (skips tags/releases creation and publishing). */
  dryRun?: boolean;
}

/**
 * Tool that runs in CI to automate the publishing of pre-built release packages.
 *
 * This tool is designed to run non-interactively in a CI environment after a release
 * staging PR has been merged. It handles Git tagging (both global and monorepo packages),
 * GitHub Release creation (with generated release notes), and publishing the packages to
 * the NPM registry (Wombat proxy) using the provided WOMBOT_TOKEN.
 */
export class PublishCiTool {
  constructor(
    protected config: NgDevConfig<{release: ReleaseConfig; github: GithubConfig}>,
    protected git: AuthenticatedGitClient,
    protected projectDir: string,
    protected options: PublishCiToolOptions,
  ) {}

  /**
   * Executes the publish-ci process.
   *
   * Validates the environment, verifies the HEAD commit matches the expected SHA,
   * resolves the pre-built packages, generates release notes by comparing versions,
   * and performs the tagging, release creation, and NPM publishing.
   *
   * @throws {Error} If WOMBOT_TOKEN is missing (and not in dry-run), if HEAD SHA doesn't match
   * expected SHA, if no built packages are found, or if any GitHub/NPM API operation fails.
   */
  async run() {
    if (!this.options.dryRun && !process.env['WOMBOT_TOKEN']) {
      throw new Error('WOMBOT_TOKEN environment variable is not defined.');
    }

    this.assertExpectedSha();

    const builtPackages = findBuiltPackages(this.options.builtPackagesDir);
    if (builtPackages.length === 0) {
      throw new Error(`No built packages found under directory ${this.options.builtPackagesDir}`);
    }

    const builtPackagesWithInfo = await analyzeAndExtendBuiltPackagesWithInfo(
      builtPackages,
      this.config.release.npmPackages,
    );

    const beforeStagingSha = this.getBeforeStagingSha();

    const newVersion = readPackageJsonAtRef(this.git, 'HEAD').version;
    const versionAtBeforeStaging = readPackageJsonAtRef(this.git, beforeStagingSha).version;

    const newSemver = semver.parse(newVersion);
    if (!newSemver) {
      throw new Error(`Failed to parse version ${newVersion} as semver.`);
    }
    const versionAtBeforeStagingSemver = semver.parse(versionAtBeforeStaging);
    if (!versionAtBeforeStagingSemver) {
      throw new Error(`Failed to parse version ${versionAtBeforeStaging} as semver.`);
    }

    const previousVersionTag = this.getPreviousVersionTag(newSemver, versionAtBeforeStagingSemver);

    const releaseNotes = await ReleaseNotes.forRange(
      this.git,
      newSemver,
      previousVersionTag,
      beforeStagingSha,
    );

    const npmDistTag = await determineNpmDistTag(newSemver, this.config.release, this.git);

    await this.createGithubReleaseAndTags(newVersion, newSemver, releaseNotes, npmDistTag);

    await this.publishAndDeprecatePackages(builtPackagesWithInfo, npmDistTag);
  }

  /**
   * Asserts that the current HEAD commit SHA matches the expected SHA passed in options.
   * @throws {Error} If the HEAD SHA does not match the expected SHA.
   */
  private assertExpectedSha() {
    const headSha = this.git.run(['rev-parse', 'HEAD']).stdout.trim();
    if (headSha !== this.options.expectedSha) {
      throw new Error(`Expected HEAD SHA to be ${this.options.expectedSha}, but got ${headSha}.`);
    }
  }

  /**
   * Resolves the SHA of the commit immediately prior to the release staging changes.
   *
   * Analyzes the parents of the current HEAD commit. If it is a merge commit (typically the
   * merged staging PR), it identifies the parent of the staging commit. Otherwise, it defaults
   * to the single parent of HEAD.
   *
   * @returns The SHA of the pre-staging commit.
   * @throws {Error} If HEAD has no parents, or if the parent structure is unexpected.
   */
  private getBeforeStagingSha(): string {
    const parentsOutput = this.git.run(['show', '--format=%P', '-s', 'HEAD']).stdout.trim();
    const parents = parentsOutput ? parentsOutput.split(' ') : [];
    if (parents.length >= 2) {
      const stagingCommitSha = parents[1];
      const stagingCommitParentsOutput = this.git
        .run(['show', '--format=%P', '-s', stagingCommitSha])
        .stdout.trim();
      const stagingCommitParents = stagingCommitParentsOutput
        ? stagingCommitParentsOutput.split(' ')
        : [];
      if (stagingCommitParents.length === 0) {
        throw new Error(`Could not find parent for staging commit ${stagingCommitSha}`);
      }
      return stagingCommitParents[0];
    } else if (parents.length === 1) {
      return parents[0];
    } else {
      throw new Error('HEAD commit has no parents.');
    }
  }

  /**
   * Resolves the previous version Git tag to compare against for generating release notes.
   *
   * If the release is a transition from a pre-release (e.g. RC) to a stable version, it searches
   * the repository tags for the highest stable version that is less than the new version.
   * Otherwise, it defaults to the version tag associated with the pre-staging commit.
   *
   * @param newSemver The version currently being published.
   * @param versionAtBeforeStagingSemver The version at the pre-staging commit.
   * @returns The git tag name of the previous version (e.g. 'v1.2.3').
   * @throws {Error} If a previous stable version tag cannot be resolved when transitioning to stable.
   */
  private getPreviousVersionTag(
    newSemver: semver.SemVer,
    versionAtBeforeStagingSemver: semver.SemVer,
  ): string {
    if (newSemver.prerelease.length === 0 && versionAtBeforeStagingSemver.prerelease.length > 0) {
      this.git.run(['fetch', '--tags', this.git.getRepoGitUrl()]);
      const tagsOutput = this.git.run(['tag', '-l', 'v*']).stdout.trim();
      const tags = tagsOutput ? tagsOutput.split('\n').map((t) => t.trim()) : [];
      let highestStableVersion: semver.SemVer | null = null;
      for (const tag of tags) {
        const versionStr = tag.startsWith('v') ? tag.slice(1) : tag;
        const parsed = semver.parse(versionStr);
        if (parsed && parsed.prerelease.length === 0) {
          if (semver.lt(parsed, newSemver)) {
            if (highestStableVersion === null || semver.gt(parsed, highestStableVersion)) {
              highestStableVersion = parsed;
            }
          }
        }
      }
      if (highestStableVersion === null) {
        throw new Error(
          `Could not find a previous stable version tag matching v* less than ${newSemver.format()}`,
        );
      }
      return `v${highestStableVersion.format()}`;
    }
    return `v${versionAtBeforeStagingSemver.format()}`;
  }

  /**
   * Creates the GitHub Release and Git tags for the version being published.
   *
   * Creates the global version tag (`vX.Y.Z`), the GitHub Release entry containing the
   * release notes, and individual monorepo package tags (`@angular/core@X.Y.Z`) if configured.
   * These operations are idempotent and will gracefully log warnings if a tag or release
   * already exists.
   *
   * @param newVersion The version string to release.
   * @param newSemver The parsed SemVer representation of the version.
   * @param releaseNotes The generated release notes for this version range.
   * @param npmDistTag The determined NPM distribution tag (used to flag latest releases on GitHub).
   */
  private async createGithubReleaseAndTags(
    newVersion: string,
    newSemver: semver.SemVer,
    releaseNotes: ReleaseNotes,
    npmDistTag: NpmDistTag,
  ) {
    const globalTagName = `v${newVersion}`;
    if (this.options.dryRun) {
      Log.info(`[Dry-Run] Would tag global tag: ${globalTagName}`);
    } else {
      try {
        await this.git.github.git.createRef({
          ...this.git.remoteParams,
          ref: `refs/tags/${globalTagName}`,
          sha: this.options.expectedSha,
        });
        Log.info(green(`  ✓   Tagged ${globalTagName} release upstream.`));
      } catch (e) {
        if (isGithubApiError(e) && e.status === 422) {
          Log.warn(`Warning: Tag ${globalTagName} already exists, skipping tag creation.`);
        } else {
          throw e;
        }
      }
    }

    let releaseBody = await releaseNotes.getGithubReleaseEntry();
    if (releaseBody.length > githubReleaseBodyLimit) {
      const baseUrl = getFileContentsUrl(this.git, globalTagName, workspaceRelativeChangelogPath);
      const urlFragment = await releaseNotes.getUrlFragmentForRelease();
      const releaseNotesUrl = `${baseUrl}#${urlFragment}`;
      releaseBody =
        `Release notes are too large to be captured here. ` +
        `[View all changes here](${releaseNotesUrl}).`;
    }

    if (this.options.dryRun) {
      Log.info(`[Dry-Run] Would create GitHub Release for tag: ${globalTagName}`);
    } else {
      try {
        await this.git.github.repos.createRelease({
          ...this.git.remoteParams,
          name: globalTagName,
          tag_name: globalTagName,
          prerelease: newSemver.prerelease.length > 0,
          make_latest: npmDistTag === 'latest' ? 'true' : 'false',
          body: releaseBody,
        });
        Log.info(green(`  ✓   Created ${globalTagName} release in Github.`));
      } catch (e) {
        if (isGithubApiError(e) && e.status === 422) {
          Log.warn(
            `Warning: GitHub release for ${globalTagName} already exists, skipping release creation.`,
          );
        } else {
          throw e;
        }
      }
    }

    if (this.config.release.npmPackages.length > 1) {
      for (const npmPkg of this.config.release.npmPackages) {
        const monorepoTagName = `${npmPkg.name}@${newVersion}`;
        if (this.options.dryRun) {
          Log.info(`[Dry-Run] Would tag monorepo package: ${monorepoTagName}`);
        } else {
          try {
            await this.git.github.git.createRef({
              ...this.git.remoteParams,
              ref: `refs/tags/${monorepoTagName}`,
              sha: this.options.expectedSha,
            });
            Log.info(green(`  ✓   Tagged monorepo package release: ${monorepoTagName}`));
          } catch (e) {
            if (isGithubApiError(e) && e.status === 422) {
              Log.warn(`Warning: Tag ${monorepoTagName} already exists, skipping tag creation.`);
            } else {
              throw e;
            }
          }
        }
      }
    }
  }

  /**
   * Publishes the pre-built packages to the NPM registry via Wombat Dressing Room.
   *
   * Temporarily configures the local `.npmrc` file to point to the Wombat registry and include
   * the authenticated `WOMBOT_TOKEN`. After publishing all resolved packages, the original
   * `.npmrc` is restored (or deleted if it did not exist before).
   *
   * @param builtPackages List of built packages to be published.
   * @param npmDistTag The NPM distribution tag (e.g. 'latest', 'next') to publish under.
   */
  private async publishAndDeprecatePackages(
    builtPackages: BuiltPackageWithInfo[],
    npmDistTag: NpmDistTag,
  ) {
    if (this.options.dryRun) {
      for (const pkg of builtPackages) {
        Log.info(`[Dry-Run] Would publish package: ${pkg.name} to Wombat`);
        if (pkg.deprecated) {
          Log.info(`[Dry-Run] Would deprecate package: ${pkg.name}@${pkg.deprecated.version}`);
        }
      }
    } else {
      const tempDir = mkdtempSync(join(tmpdir(), 'angular-publish-ci-'));
      const tempNpmrcPath = join(tempDir, '.npmrc');
      const originalUserconfig = process.env['NPM_CONFIG_USERCONFIG'];

      try {
        const wombatNpmrcContent =
          [
            `registry=https://wombat-dressing-room.appspot.com/`,
            `//wombat-dressing-room.appspot.com/:_authToken=\${WOMBOT_TOKEN}`,
          ].join('\n') + '\n';
        writeFileSync(tempNpmrcPath, wombatNpmrcContent);
        Log.info(green(`  ✓   Created temporary .npmrc for Wombat registry.`));

        // Set the environment variable to point to the temporary config
        process.env['NPM_CONFIG_USERCONFIG'] = tempNpmrcPath;

        // Publish packages
        for (const pkg of builtPackages) {
          Log.info(`Publishing "${pkg.name}"...`);
          await NpmCommand.publish(pkg.outputPath, npmDistTag, undefined);
          Log.info(green(`  ✓   Successfully published "${pkg.name}".`));
        }

        // Deprecate packages if configured
        for (const pkg of builtPackages) {
          if (!pkg.deprecated) {
            continue;
          }
          Log.info(`Deprecating "${pkg.name}"...`);
          const {version, message} = pkg.deprecated;
          await NpmCommand.deprecate(pkg.name, version, message, undefined);
          Log.info(green(`  ✓   Successfully deprecated "${pkg.name}@${version}".`));
        }
      } finally {
        // Guaranteed cleanup of files and environment
        try {
          rmSync(tempDir, {recursive: true, force: true});
        } catch (e) {
          Log.warn(`Warning: Failed to clean up temporary directory ${tempDir}: ${e}`);
        } finally {
          if (originalUserconfig !== undefined) {
            process.env['NPM_CONFIG_USERCONFIG'] = originalUserconfig;
          } else {
            delete process.env['NPM_CONFIG_USERCONFIG'];
          }
        }
      }
    }
  }
}

/**
 * Reads and parses the `package.json` file at a specified Git reference.
 *
 * @param git The authenticated Git client.
 * @param ref The Git reference (e.g. branch name, SHA, tag) to read from.
 * @returns The parsed JSON content of the `package.json` file.
 */
function readPackageJsonAtRef(git: AuthenticatedGitClient, ref: string): any {
  const content = git.run(['show', `${ref}:package.json`]).stdout.trim();
  return JSON.parse(content);
}

/**
 * Recursively searches a directory to find all built packages.
 *
 * A directory is considered a built package if it contains a `package.json` file
 * with a valid `name` property.
 *
 * @param dir The root directory to start the search from.
 * @returns An array of `BuiltPackage` objects containing the name and output path.
 * @throws {Error} If the specified directory does not exist.
 */
function findBuiltPackages(dir: string): BuiltPackage[] {
  if (!existsSync(dir)) {
    throw new Error(`The built packages directory does not exist: ${dir}`);
  }
  const packages: BuiltPackage[] = [];
  const walk = (currentDir: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(currentDir, {withFileTypes: true});
    } catch (e) {
      return;
    }
    const hasPackageJson = entries.some((e) => e.isFile() && e.name === 'package.json');
    if (hasPackageJson) {
      try {
        const pkgJson = JSON.parse(readFileSync(join(currentDir, 'package.json'), 'utf8'));
        if (pkgJson.name) {
          if (!pkgJson.private) {
            packages.push({
              name: pkgJson.name,
              outputPath: currentDir,
            });
          }
          // Stop traversing deeper once we find a package boundary (even if private)
          // to avoid looking into nested node_modules or sub-packages.
          return;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(join(currentDir, entry.name));
      }
    }
  };
  walk(dir);
  return packages;
}

/**
 * Determines the NPM distribution tag (e.g. 'latest', 'next') for the version being published.
 *
 * Checks if the version falls under an active or inactive LTS branch, a pre-release train,
 * or if it is a new major version that should be published as 'next' temporarily.
 *
 * @param newSemver The version being published.
 * @param config The release configuration.
 * @param git The authenticated Git client.
 * @returns The determined NPM distribution tag.
 */
async function determineNpmDistTag(
  newSemver: semver.SemVer,
  config: ReleaseConfig,
  git: AuthenticatedGitClient,
): Promise<NpmDistTag> {
  const {active: activeLts, inactive: inactiveLts} =
    await fetchLongTermSupportBranchesFromNpm(config);
  const ltsBranch = [...activeLts, ...inactiveLts].find((b) => b.version.major === newSemver.major);
  if (ltsBranch) {
    return ltsBranch.npmDistTag;
  }

  const repo = {
    owner: git.remoteConfig.owner,
    name: git.remoteConfig.name,
    api: git.github,
    nextBranchName: git.mainBranchName,
  };
  const activeTrains = await ActiveReleaseTrains.fetch(repo);

  if (newSemver.prerelease.length > 0) {
    if (
      activeTrains.exceptionalMinor !== null &&
      newSemver.major === activeTrains.exceptionalMinor.version.major &&
      newSemver.minor === activeTrains.exceptionalMinor.version.minor
    ) {
      return 'do-not-use-exceptional-minor';
    }
    return 'next';
  }

  if (newSemver.major > activeTrains.latest.version.major) {
    return 'next';
  }

  return 'latest';
}
