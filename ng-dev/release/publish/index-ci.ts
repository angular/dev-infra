/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {join} from 'path';
import {readdirSync, statSync, readFileSync, existsSync, writeFileSync, rmSync} from 'fs';
import semver from 'semver';
import {ReleaseConfig, BuiltPackage} from '../config/index.js';
import {GithubConfig, NgDevConfig} from '../../utils/config.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {ReleaseNotes, workspaceRelativeChangelogPath} from '../notes/release-notes.js';
import {NpmCommand} from '../versioning/npm-command.js';
import {getFileContentsUrl} from '../../utils/git/github-urls.js';
import {isGithubApiError} from '../../utils/git/github.js';
import {githubReleaseBodyLimit} from './constants.js';
import {green, Log} from '../../utils/logging.js';
import {fetchLongTermSupportBranchesFromNpm} from '../versioning/long-term-support.js';
import {ActiveReleaseTrains} from '../versioning/active-release-trains.js';
import {NpmDistTag} from '../versioning/npm-registry.js';

export interface PublishCiToolOptions {
  builtPackagesDir: string;
  expectedSha: string;
  dryRun?: boolean;
}

export class PublishCiTool {
  constructor(
    protected config: NgDevConfig<{release: ReleaseConfig; github: GithubConfig}>,
    protected git: AuthenticatedGitClient,
    protected projectDir: string,
    protected options: PublishCiToolOptions,
  ) {}

  async run() {
    // Assert SHA: Verify git rev-parse HEAD matches expectedSha.
    const headSha = this.git.run(['rev-parse', 'HEAD']).stdout.trim();
    if (headSha !== this.options.expectedSha) {
      throw new Error(`Expected HEAD SHA to be ${this.options.expectedSha}, but got ${headSha}.`);
    }

    // Determine beforeStagingSha
    const parentsOutput = this.git.run(['show', '--format=%P', '-s', 'HEAD']).stdout.trim();
    const parents = parentsOutput ? parentsOutput.split(' ') : [];
    let beforeStagingSha: string;
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
      beforeStagingSha = stagingCommitParents[0];
    } else if (parents.length === 1) {
      beforeStagingSha = parents[0];
    } else {
      throw new Error('HEAD commit has no parents.');
    }

    // Parse Versions
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

    // Resolve previousVersionTag
    let previousVersionTag: string;
    if (newSemver.prerelease.length === 0 && versionAtBeforeStagingSemver.prerelease.length > 0) {
      // Stable release compared to prerelease. We must find the previous stable version.
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
          `Could not find a previous stable version tag matching v* less than ${newVersion}`,
        );
      }
      previousVersionTag = `v${highestStableVersion.format()}`;
    } else {
      previousVersionTag = `v${versionAtBeforeStagingSemver.format()}`;
    }

    // Generate Release Notes
    const releaseNotes = await ReleaseNotes.forRange(
      this.git,
      newSemver,
      previousVersionTag,
      beforeStagingSha,
    );

    // Determine NPM dist tag
    const npmDistTag = await determineNpmDistTag(newSemver, this.config.release, this.git);

    // Create GitHub Release and Tags (Idempotent)
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

    // Monorepo Tags
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

    // Publish to NPM/Wombat
    const builtPackages = findBuiltPackages(this.options.builtPackagesDir);
    if (builtPackages.length === 0) {
      throw new Error(`No built packages found under directory ${this.options.builtPackagesDir}`);
    }

    if (this.options.dryRun) {
      for (const pkg of builtPackages) {
        Log.info(`[Dry-Run] Would write .npmrc and publish package: ${pkg.name} to Wombat`);
      }
    } else {
      const npmrcPath = join(this.projectDir, '.npmrc');
      let originalNpmrc: string | null = null;
      if (existsSync(npmrcPath)) {
        originalNpmrc = readFileSync(npmrcPath, 'utf8');
      }

      try {
        const wombatNpmrcContent =
          [
            `registry=https://wombat-dressing-room.appspot.com/`,
            `//wombat-dressing-room.appspot.com/:_authToken=\${WOMBOT_TOKEN}`,
          ].join('\n') + '\n';
        writeFileSync(npmrcPath, wombatNpmrcContent);
        Log.info(green(`  ✓   Configured .npmrc to use Wombat registry.`));

        if (!process.env['WOMBOT_TOKEN']) {
          throw new Error('WOMBOT_TOKEN environment variable is not defined.');
        }

        for (const pkg of builtPackages) {
          Log.info(`Publishing "${pkg.name}"...`);
          await NpmCommand.publish(
            pkg.outputPath,
            npmDistTag,
            'https://wombat-dressing-room.appspot.com/',
          );
          Log.info(green(`  ✓   Successfully published "${pkg.name}".`));
        }
      } finally {
        if (originalNpmrc !== null) {
          writeFileSync(npmrcPath, originalNpmrc);
        } else if (existsSync(npmrcPath)) {
          rmSync(npmrcPath);
        }
      }
    }
  }
}

function readPackageJsonAtRef(git: AuthenticatedGitClient, ref: string): any {
  const content = git.run(['show', `${ref}:package.json`]).stdout.trim();
  return JSON.parse(content);
}

function findBuiltPackages(dir: string): BuiltPackage[] {
  const packages: BuiltPackage[] = [];
  const walk = (currentDir: string) => {
    const files = readdirSync(currentDir);
    if (files.includes('package.json')) {
      try {
        const pkgJson = JSON.parse(readFileSync(join(currentDir, 'package.json'), 'utf8'));
        if (pkgJson.name) {
          packages.push({
            name: pkgJson.name,
            outputPath: currentDir,
          });
          return;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    for (const file of files) {
      const fullPath = join(currentDir, file);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      }
    }
  };
  walk(dir);
  return packages;
}

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
