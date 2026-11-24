/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join, resolve, sep} from 'path';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
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
import {
  assertValidExitGateProject,
  assertValidNpmDistTag,
  buildExitGateNpmrcContent,
  createExitGateManifest,
  createManifestFileName,
  ExitGateCommand,
  getExitGateArRegistryUrl,
  getExitGateManifestGcsUri,
  PUBLIC_NPM_REGISTRY_URL,
} from '../../../../ng-dev/release/versioning/exit-gate.js';
import {getFileContentsUrl} from '../../../../ng-dev/utils/git/github-urls.js';
import {PublishSummary} from './publish-summary.js';
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
  /** OSS Exit Gate project name (overrides `config.release.exitGate.projectName`). */
  exitGateProject?: string;
  /** Whether to run in dry-run mode (skips tags/releases creation, AR staging, and Exit Gate triggering). */
  dryRun?: boolean;
  /**
   * Whether to use local Google Cloud Application Default Credentials instead of CI credentials.
   * Cannot be enabled in CI environments.
   */
  useApplicationDefaultCredentials?: boolean;
  /** Whether to skip creating Git tags and GitHub releases. */
  skipTagging?: boolean;
  /** Optional callback invoked to mask dynamically acquired secrets in CI logs. */
  maskSecret?: (secret: string) => void;
}

/**
 * Tool that runs in CI to automate the publishing of pre-built release packages.
 *
 * This tool is designed to run non-interactively in a CI environment after a release
 * staging PR has been merged. It handles Git tagging (both global and monorepo packages),
 * GitHub Release creation (with generated release notes), staging pre-built packages to
 * Google Cloud Artifact Registry, and uploading a release manifest to GCS to trigger
 * asynchronous publishing to npmjs.org via OSS Exit Gate.
 */
export class PublishCiTool {
  private summary: PublishSummary;

  constructor(
    protected config: NgDevConfig<{release: ReleaseConfig; github: GithubConfig}>,
    protected git: AuthenticatedGitClient,
    protected projectDir: string,
    protected options: PublishCiToolOptions,
  ) {
    this.summary = new PublishSummary({dryRun: options.dryRun});
  }

  /**
   * Executes the publish-ci process.
   */
  async run() {
    if (
      this.options.useApplicationDefaultCredentials &&
      (process.env['CI'] || process.env['GITHUB_ACTIONS'])
    ) {
      throw new Error('useApplicationDefaultCredentials cannot be used in a CI environment.');
    }

    let exitGateProject = this.options.exitGateProject || this.config.release.exitGate?.projectName;
    if (exitGateProject !== undefined && exitGateProject !== '') {
      exitGateProject = assertValidExitGateProject(exitGateProject);
    } else if (!this.options.dryRun) {
      throw new Error(
        'OSS Exit Gate project name is not defined. Configure `release.exitGate.projectName` or pass `exitGateProject`.',
      );
    }

    this.assertExpectedSha();

    const newVersion = readPackageJsonAtRef(this.git, 'HEAD').version;
    const builtPackagesWithInfo = await this.resolveTgzPackages(newVersion);

    const newSemver = semver.parse(newVersion);
    if (!newSemver) {
      throw new Error(`Failed to parse version ${newVersion} as semver.`);
    }

    const npmDistTag = await determineNpmDistTag(newSemver, this.config.release, this.git);
    assertValidNpmDistTag(npmDistTag);

    if (!this.options.skipTagging) {
      const beforeStagingSha = this.getBeforeStagingSha();
      const versionAtBeforeStaging = readPackageJsonAtRef(this.git, beforeStagingSha).version;
      const versionAtBeforeStagingSemver = semver.parse(versionAtBeforeStaging);
      if (!versionAtBeforeStagingSemver) {
        throw new Error(`Failed to parse version ${versionAtBeforeStaging} as semver.`);
      }

      const previousVersionTag = this.getPreviousVersionTag(
        newSemver,
        versionAtBeforeStagingSemver,
      );

      const releaseNotes = await ReleaseNotes.forRange(
        this.git,
        newSemver,
        previousVersionTag,
        beforeStagingSha,
      );

      await this.createGithubReleaseAndTags(newVersion, newSemver, releaseNotes, npmDistTag);
    } else {
      Log.info('Skipping Git tagging and GitHub Release creation as configured.');
    }

    if (!this.summary.hasFailures()) {
      await this.publishPackagesViaExitGate(
        builtPackagesWithInfo,
        npmDistTag,
        newVersion,
        exitGateProject,
      );
    } else {
      Log.error('Skipping package publishing due to tagging or release creation failures.');
    }

    const markdownSummary = this.summary.toMarkdown();
    Log.info('\n' + markdownSummary);

    if (process.env['GITHUB_STEP_SUMMARY']) {
      try {
        writeFileSync(process.env['GITHUB_STEP_SUMMARY'], markdownSummary, {flag: 'a'});
        Log.info(green('  ✓   Written job summary to GITHUB_STEP_SUMMARY.'));
      } catch (e) {
        Log.warn(`Warning: Failed to write GITHUB_STEP_SUMMARY: ${e}`);
      }
    }

    if (this.summary.hasFailures()) {
      const failures = this.summary.getFailedItems().join('\n');
      throw new Error(`Publish failed with the following errors:\n${failures}`);
    }
  }

  /** Resolves the pre-built .tgz packages from the builtPackagesDir. */
  private async resolveTgzPackages(version: string): Promise<BuiltPackageWithInfo[]> {
    if (!existsSync(this.options.builtPackagesDir)) {
      throw new Error(
        `The built packages directory does not exist: ${this.options.builtPackagesDir}`,
      );
    }
    const realBuiltDir = realpathSync(this.options.builtPackagesDir);
    const builtPackages: BuiltPackage[] = [];
    for (const npmPkg of this.config.release.npmPackages) {
      const scopeAndName = npmPkg.name.startsWith('@') ? npmPkg.name.slice(1) : npmPkg.name;
      const fileName = `${scopeAndName.replace(/\//g, '-')}-${version}.tgz`;
      const tgzPath = join(this.options.builtPackagesDir, fileName);

      if (!existsSync(tgzPath)) {
        throw new Error(`Expected built package file not found: ${tgzPath}`);
      }
      if (!lstatSync(tgzPath).isFile()) {
        throw new Error(`Built package path is not a regular file: ${tgzPath}`);
      }
      const realTgzPath = realpathSync(tgzPath);
      const expectedPrefix = realBuiltDir.endsWith(sep) ? realBuiltDir : realBuiltDir + sep;
      if (!realTgzPath.startsWith(expectedPrefix)) {
        throw new Error(
          `Built package path escapes builtPackagesDir: ${tgzPath} (resolved to ${realTgzPath})`,
        );
      }
      builtPackages.push({
        name: npmPkg.name,
        outputPath: tgzPath,
      });
    }

    return await analyzeAndExtendBuiltPackagesWithInfo(
      builtPackages,
      this.config.release.npmPackages,
    );
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
      this.summary.addTag({name: globalTagName, status: 'CREATED'});
    } else {
      try {
        await this.git.github.git.createRef({
          ...this.git.remoteParams,
          ref: `refs/tags/${globalTagName}`,
          sha: this.options.expectedSha,
        });
        Log.info(green(`  ✓   Tagged ${globalTagName} release upstream.`));
        this.summary.addTag({name: globalTagName, status: 'CREATED'});
      } catch (e) {
        if (isGithubApiError(e) && e.status === 422) {
          const verificationError = await this.verifyExistingTagSha(globalTagName);
          if (verificationError === null) {
            Log.warn(`Warning: Tag ${globalTagName} already exists, skipping tag creation.`);
            this.summary.addTag({name: globalTagName, status: 'SKIPPED'});
          } else {
            this.summary.addTag({name: globalTagName, status: 'FAILED', error: verificationError});
          }
        } else {
          Log.error(`Failed to tag global tag ${globalTagName}: ${e}`);
          this.summary.addTag({name: globalTagName, status: 'FAILED', error: String(e)});
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
      this.summary.setRelease({name: globalTagName, status: 'CREATED'});
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
        this.summary.setRelease({name: globalTagName, status: 'CREATED'});
      } catch (e) {
        if (isGithubApiError(e) && e.status === 422) {
          const verificationError = await this.verifyExistingTagSha(globalTagName);
          if (verificationError === null) {
            Log.warn(
              `Warning: GitHub release for ${globalTagName} already exists, skipping release creation.`,
            );
            this.summary.setRelease({name: globalTagName, status: 'SKIPPED'});
          } else {
            this.summary.setRelease({
              name: globalTagName,
              status: 'FAILED',
              error: verificationError,
            });
          }
        } else {
          Log.error(`Failed to create GitHub release ${globalTagName}: ${e}`);
          this.summary.setRelease({name: globalTagName, status: 'FAILED', error: String(e)});
        }
      }
    }

    if (this.config.release.npmPackages.length > 1) {
      for (const npmPkg of this.config.release.npmPackages) {
        const monorepoTagName = `${npmPkg.name}@${newVersion}`;
        if (this.options.dryRun) {
          Log.info(`[Dry-Run] Would tag monorepo package: ${monorepoTagName}`);
          this.summary.addTag({name: monorepoTagName, status: 'CREATED'});
        } else {
          try {
            await this.git.github.git.createRef({
              ...this.git.remoteParams,
              ref: `refs/tags/${monorepoTagName}`,
              sha: this.options.expectedSha,
            });
            Log.info(green(`  ✓   Tagged monorepo package release: ${monorepoTagName}`));
            this.summary.addTag({name: monorepoTagName, status: 'CREATED'});
          } catch (e) {
            if (isGithubApiError(e) && e.status === 422) {
              const verificationError = await this.verifyExistingTagSha(monorepoTagName);
              if (verificationError === null) {
                Log.warn(`Warning: Tag ${monorepoTagName} already exists, skipping tag creation.`);
                this.summary.addTag({name: monorepoTagName, status: 'SKIPPED'});
              } else {
                this.summary.addTag({
                  name: monorepoTagName,
                  status: 'FAILED',
                  error: verificationError,
                });
              }
            } else {
              Log.error(`Failed to tag monorepo package ${monorepoTagName}: ${e}`);
              this.summary.addTag({name: monorepoTagName, status: 'FAILED', error: String(e)});
            }
          }
        }
      }
    }
  }

  /**
   * Verifies that an already-existing Git tag on GitHub points to `this.options.expectedSha`.
   *
   * @returns `null` if the tag points to `expectedSha`, or an error message if it points to a
   *   different commit or if the lookup fails.
   */
  private async verifyExistingTagSha(tagName: string): Promise<string | null> {
    try {
      const existingRef = await this.git.github.git.getRef({
        ...this.git.remoteParams,
        ref: `tags/${tagName}`,
      });
      let existingSha = existingRef.data?.object?.sha;
      if (!existingSha) {
        const errorMsg = `Failed to resolve SHA for existing tag ${tagName}.`;
        Log.error(errorMsg);
        return errorMsg;
      }
      if (existingRef.data?.object?.type === 'tag') {
        const tagObject = await this.git.github.git.getTag({
          ...this.git.remoteParams,
          tag_sha: existingSha,
        });
        existingSha = tagObject.data?.object?.sha;
        if (!existingSha) {
          const errorMsg = `Failed to resolve commit SHA for annotated tag ${tagName}.`;
          Log.error(errorMsg);
          return errorMsg;
        }
      }
      if (existingSha === this.options.expectedSha) {
        return null;
      }
      const errorMsg =
        `Existing tag ${tagName} points to ${existingSha}, ` +
        `which does not match expected SHA ${this.options.expectedSha}.`;
      Log.error(errorMsg);
      return errorMsg;
    } catch (err) {
      const errorMsg = `Failed to verify existing tag ${tagName}: ${err}`;
      Log.error(errorMsg);
      return errorMsg;
    }
  }

  /**
   * Stages pre-built packages to Google Cloud Artifact Registry and uploads a manifest to GCS
   * to trigger asynchronous publishing to npmjs.org via OSS Exit Gate.
   *
   * @param builtPackages List of built packages to be published.
   * @param npmDistTag The NPM distribution tag (e.g. 'latest', 'next') to publish under.
   * @param version The release version string being published.
   * @param exitGateProject The OSS Exit Gate project name (may be undefined in dry-run mode).
   */
  private async publishPackagesViaExitGate(
    builtPackages: BuiltPackageWithInfo[],
    npmDistTag: NpmDistTag,
    version: string,
    exitGateProject: string | undefined,
  ) {
    if (this.options.dryRun) {
      const projectLabel = exitGateProject || '<unconfigured>';
      const arRegistryUrl = exitGateProject
        ? getExitGateArRegistryUrl(exitGateProject)
        : 'https://us-npm.pkg.dev/oss-exit-gate-prod/<project>--npm/';

      for (const pkg of builtPackages) {
        Log.info(
          `[Dry-Run] Would stage package: ${pkg.name}@${version} to Artifact Registry (${arRegistryUrl})`,
        );
        this.summary.addPackage({name: pkg.name, version, status: 'STAGED'});
        if (pkg.deprecated) {
          Log.warn(
            `[Dry-Run] Skipping deprecation for ${pkg.name}@${pkg.deprecated.version} ` +
              '(unsupported by OSS Exit Gate; manual deprecation required after publish).',
          );
          this.summary.addWarning(
            `Manual deprecation required for \`${pkg.name}@${pkg.deprecated.version}\`: ` +
              `\`npm deprecate "${pkg.name}@${pkg.deprecated.version}" "${pkg.deprecated.message}"\``,
          );
        }
      }

      const manifest = createExitGateManifest(npmDistTag);
      const manifestFileName = createManifestFileName(version, this.options.expectedSha);
      const gcsUri = exitGateProject
        ? getExitGateManifestGcsUri(exitGateProject, manifestFileName)
        : `gs://oss-exit-gate-prod-projects-bucket/<project>/npm/manifests/${manifestFileName}`;
      Log.info(
        `[Dry-Run] Would upload OSS Exit Gate manifest to ${gcsUri}:\n${JSON.stringify(manifest, null, 2)}`,
      );
      this.summary.setExitGate({
        project: projectLabel,
        distTag: npmDistTag,
        manifestUri: gcsUri,
        status: 'TRIGGERED',
        detail: 'Dry-run',
      });
      return;
    }

    if (!exitGateProject) {
      throw new Error(
        'OSS Exit Gate project name is not defined. Configure `release.exitGate.projectName` or pass `exitGateProject`.',
      );
    }

    const tempDir = mkdtempSync(join(tmpdir(), 'angular-publish-ci-'));
    chmodSync(tempDir, 0o700);

    try {
      // Phase 1: Check existing versions against public npm.
      const emptyNpmrcPath = join(tempDir, 'empty.npmrc');
      writeFileSync(emptyNpmrcPath, '', {mode: 0o600});
      const checkEnv: NodeJS.ProcessEnv = {
        ...process.env,
        NPM_CONFIG_USERCONFIG: emptyNpmrcPath,
      };

      const packagesToStage: BuiltPackageWithInfo[] = [];
      for (const pkg of builtPackages) {
        Log.info(`Checking if "${pkg.name}@${version}" is already published on NPM...`);
        try {
          const exists = await NpmCommand.checkVersionExists(
            pkg.name,
            version,
            PUBLIC_NPM_REGISTRY_URL,
            tempDir,
            checkEnv,
          );
          if (exists) {
            Log.warn(`Warning: Package "${pkg.name}@${version}" is already published. Skipping.`);
            this.summary.addPackage({name: pkg.name, version, status: 'SKIPPED'});
            continue;
          }
          packagesToStage.push(pkg);
        } catch (e) {
          Log.error(`Failed to check existing version for "${pkg.name}@${version}": ${e}`);
          this.summary.addPackage({
            name: pkg.name,
            version,
            status: 'FAILED',
            error: String(e),
          });
        }
      }

      // Phase 2: Gate before Artifact Registry staging.
      if (this.summary.hasFailures()) {
        Log.error('Aborting Artifact Registry staging due to package version check failures.');
        this.summary.setExitGate({
          project: exitGateProject,
          distTag: npmDistTag,
          status: 'SKIPPED',
          detail: 'Aborted due to package version check failures.',
        });
        return;
      }

      if (packagesToStage.length === 0) {
        Log.info(
          'All packages are already published on NPM. Skipping Artifact Registry staging and Exit Gate trigger.',
        );
        this.summary.setExitGate({
          project: exitGateProject,
          distTag: npmDistTag,
          status: 'SKIPPED',
          detail: 'All packages already published on NPM.',
        });
        return;
      }

      // Phase 3: Authenticate, clean stale AR packages, and stage to Artifact Registry.
      const accessToken = await ExitGateCommand.getAccessToken({
        useApplicationDefault: this.options.useApplicationDefaultCredentials,
        maskSecret: this.options.maskSecret,
      });
      const gcloudOptions = this.options.useApplicationDefaultCredentials
        ? {accessToken}
        : undefined;

      Log.info(`Cleaning stale packages in Artifact Registry for project "${exitGateProject}"...`);
      const deletedPackages = gcloudOptions
        ? await ExitGateCommand.cleanArtifactRegistryPackages(exitGateProject, gcloudOptions)
        : await ExitGateCommand.cleanArtifactRegistryPackages(exitGateProject);
      if (deletedPackages.length > 0) {
        Log.warn(
          `Cleaned ${deletedPackages.length} stale package(s) from Artifact Registry before staging.`,
        );
      }

      const arNpmrcPath = join(tempDir, 'ar.npmrc');
      writeFileSync(arNpmrcPath, buildExitGateNpmrcContent(exitGateProject, 'EXIT_GATE_AR_TOKEN'), {
        mode: 0o600,
      });

      const arRegistryUrl = getExitGateArRegistryUrl(exitGateProject);
      const publishEnv: NodeJS.ProcessEnv = {
        ...process.env,
        NPM_CONFIG_USERCONFIG: arNpmrcPath,
        EXIT_GATE_AR_TOKEN: accessToken,
      };

      for (const pkg of packagesToStage) {
        Log.info(`Staging "${pkg.name}@${version}" to Artifact Registry...`);
        try {
          await NpmCommand.publish(
            resolve(pkg.outputPath),
            npmDistTag,
            arRegistryUrl,
            tempDir,
            publishEnv,
          );
          Log.info(green(`  ✓   Successfully staged "${pkg.name}" to Artifact Registry.`));
          this.summary.addPackage({name: pkg.name, version, status: 'STAGED'});
        } catch (e) {
          const sanitizedError = redactSecret(String(e), accessToken);
          Log.error(`An error occurred while staging "${pkg.name}": ${sanitizedError}`);
          this.summary.addPackage({
            name: pkg.name,
            version,
            status: 'FAILED',
            error: sanitizedError,
          });
        }
      }

      // Phase 4: Upload manifest to GCS to trigger OSS Exit Gate.
      if (this.summary.hasFailures()) {
        Log.error(
          'Skipping OSS Exit Gate manifest upload due to Artifact Registry staging failures.',
        );
        this.summary.setExitGate({
          project: exitGateProject,
          distTag: npmDistTag,
          status: 'SKIPPED',
          detail: 'Aborted due to Artifact Registry staging failures.',
        });
      } else {
        const manifest = createExitGateManifest(npmDistTag);
        const manifestFileName = createManifestFileName(version, this.options.expectedSha);
        const localManifestPath = join(tempDir, manifestFileName);
        writeFileSync(localManifestPath, JSON.stringify(manifest, null, 2) + '\n', {mode: 0o600});
        try {
          const gcsUri = gcloudOptions
            ? await ExitGateCommand.uploadManifest(
                localManifestPath,
                exitGateProject,
                manifestFileName,
                gcloudOptions,
              )
            : await ExitGateCommand.uploadManifest(
                localManifestPath,
                exitGateProject,
                manifestFileName,
              );
          Log.info(green(`  ✓   Uploaded OSS Exit Gate manifest to ${gcsUri}.`));
          this.summary.setExitGate({
            project: exitGateProject,
            distTag: npmDistTag,
            manifestUri: gcsUri,
            status: 'TRIGGERED',
          });
        } catch (e) {
          const sanitizedError = redactSecret(String(e), accessToken);
          Log.error(`Failed to upload OSS Exit Gate manifest: ${sanitizedError}`);
          this.summary.setExitGate({
            project: exitGateProject,
            distTag: npmDistTag,
            status: 'FAILED',
            error: sanitizedError,
          });
        }
      }

      // Phase 5: Warn about deprecated packages (unsupported by OSS Exit Gate).
      if (!this.summary.hasFailures()) {
        for (const pkg of builtPackages) {
          if (!pkg.deprecated || this.summary.hasPackageFailed(pkg.name)) {
            continue;
          }
          const {version: deprecatedVersion, message} = pkg.deprecated;
          const manualCmd = `npm deprecate "${pkg.name}@${deprecatedVersion}" "${message}"`;
          Log.warn(
            `Warning: Skipping deprecation for "${pkg.name}@${deprecatedVersion}" because OSS Exit Gate ` +
              `does not support \`npm deprecate\`. Run manually after publishing completes: ${manualCmd}`,
          );
          this.summary.addWarning(
            `Manual deprecation required for \`${pkg.name}@${deprecatedVersion}\`: \`${manualCmd}\``,
          );
        }
      }
    } finally {
      try {
        rmSync(tempDir, {recursive: true, force: true});
      } catch (e) {
        Log.warn(`Warning: Failed to clean up temporary directory ${tempDir}: ${e}`);
      }
    }
  }
}

/** Replaces all occurrences of a secret in text to prevent accidental log or summary leakage. */
function redactSecret(text: string, secret: string): string {
  if (!secret) {
    return text;
  }
  return text.split(secret).join('[REDACTED]');
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
