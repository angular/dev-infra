/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {existsSync, cpSync} from 'fs';
import {rm} from 'fs/promises';
import {join} from 'path';

import {assertValidGithubConfig, getConfig, GithubConfig, NgDevConfig} from '../../utils/config.js';
import {assertValidReleaseConfig, BuiltPackage, DevInfraReleaseConfig} from '../config/index.js';
import {BuildWorker} from '../build/index.js';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {bold, green, Log, yellow} from '../../utils/logging.js';
import {tmpdir} from 'os';
import {SnapshotPublishOptions} from './cli.js';
import {addTokenToGitHttpsUrl} from '../../utils/git/github-urls.js';

interface SnapshotPackage extends BuiltPackage {
  snapshotRepo: string;
}

interface SnapshotRepo {
  dir: string;
  url: string;
  name: string;
  containsChanges: boolean;
}

/**
 * Paths to exclude from the snapshot commit.
 */
const PATHS_TO_EXCLUDE = ['**/MODULE.bazel.lock', '**/package-lock.json', '**/pubspec.lock'];

export class SnapshotPublisher {
  /** The current branch name. */
  readonly branchName = this.git.getCurrentBranchOrRevision();
  /** The current commit SHA. */
  readonly commitSha = this.git.run(['rev-parse', '--short', 'HEAD']).stdout.trim();
  /** The commit author string from the current commit. */
  readonly commitAuthor = this.git
    .run(['--no-pager', 'show', '-s', '--format="%an <%ae>"', 'HEAD'])
    .stdout.trim();
  /** The message of the current commit. */
  readonly commitMessage = this.git.run(['log', '--oneline', '-n', '1']).stdout.trim();
  /** The commit message for the snapshot commit. */
  readonly snapshotCommitMessage = `${this.branchName} - ${this.commitMessage}`;

  protected constructor(
    protected readonly flags: SnapshotPublishOptions,
    protected readonly git: AuthenticatedGitClient,
    protected readonly config: NgDevConfig<DevInfraReleaseConfig & {github: GithubConfig}>,
  ) {}

  static async run(flags: SnapshotPublishOptions) {
    const git = await AuthenticatedGitClient.get();
    const config = await getConfig([assertValidReleaseConfig, assertValidGithubConfig]);
    const publisher = new SnapshotPublisher(flags, git, config);
    await publisher.run();
  }

  private async run() {
    try {
      const artifacts = await this.getSnapshotArtifacts();
      const snapshots = await this.prepareSnapshotRepos(artifacts);
      await this.publishSnapshots(snapshots);
      await Promise.all(snapshots.map(({dir}) => rm(dir, {recursive: true, force: true})));
    } catch (e: unknown) {
      if (typeof e === 'number') {
        process.exit(e);
      }
      Log.error(e);
      process.exit(1);
    }
  }

  /**
   * Builds all of the snapshot packages and returns the artifacts of the build.
   */
  async getSnapshotArtifacts(): Promise<SnapshotPackage[]> {
    const packagesWithSnapshots = this.config.release.npmPackages.filter((pkg) => pkg.snapshotRepo);
    if (packagesWithSnapshots.length === 0) {
      Log.info(`  ${yellow('⚠')} No packages configured with a snapshot repo, exiting.`);
      throw 0;
    }

    Log.info(bold(`Building snapshot packages`));
    const builtPackages = await BuildWorker.invokeBuild();
    if (builtPackages === null || builtPackages.length === 0) {
      Log.error(`  ✘   No release packages have been built. Please ensure that the`);
      Log.error(`      build script is configured correctly in ".ng-dev".`);
      throw 1;
    }

    const artifacts = packagesWithSnapshots.map((pkg) => {
      const builtPkg = builtPackages.find((b) => b.name === pkg.name);
      if (!builtPkg) {
        Log.error(`  ✘   Snapshot expected for ${pkg.name}, but no build artifacts exist for it.`);
        return null;
      }
      return {
        ...builtPkg,
        snapshotRepo: pkg.snapshotRepo!,
      };
    });
    if (artifacts.some((artifact) => artifact === null)) {
      Log.error(
        `  ✘   Snapshot expected for all packages, but no build artifacts exist for some of them.`,
      );
      throw 1;
    }
    // We will have thrown already if any artifacts are null so we can safely cast as SnapshotPackage[].
    return artifacts as SnapshotPackage[];
  }

  /**
   * Prepares the snapshot repositories for publishing.
   */
  async prepareSnapshotRepos(artifacts: SnapshotPackage[]): Promise<SnapshotRepo[]> {
    Log.info(bold(`Preparing snapshot repositories`));
    return Promise.all(
      artifacts.map(async (pkg) => {
        const packageRepo = pkg.snapshotRepo;
        const owner = this.config.github.owner;
        const url = `https://github.com/${owner}/${packageRepo}.git`;
        const tmpRepoDir = join(tmpdir(), 'ng-snapshot-publishing', packageRepo);

        if (existsSync(tmpRepoDir)) {
          await rm(tmpRepoDir, {recursive: true, force: true});
        }

        const branchExistsInRemote =
          this.git
            .runGraceful(['ls-remote', '--heads', url, '--', this.branchName])
            .stdout.trim() !== '';

        Log.info(`Cloning ${url} into ${tmpRepoDir}..`);
        if (branchExistsInRemote) {
          Log.debug(`Branch ${this.branchName} already exists. Cloning that branch.`);
          this.git.run(['clone', url, tmpRepoDir, '--depth', '1', '--branch', this.branchName]);
        } else {
          Log.debug(`Branch ${this.branchName} does not exist on ${packageRepo} yet.`);
          Log.debug(
            `Cloning default branch and creating branch '${this.branchName}' on top of it.`,
          );
          this.git.run(['clone', url, tmpRepoDir, '--depth', '1']);
          this.git.run(['checkout', '-b', this.branchName], {cwd: tmpRepoDir});
        }

        await Promise.all(
          this.git
            .run(['ls-files'], {cwd: tmpRepoDir})
            .stdout.trim()
            .split('\n')
            .filter((filePath) => filePath !== '')
            .map((filePath) => rm(join(tmpRepoDir, filePath), {force: true})),
        );
        cpSync(pkg.outputPath, tmpRepoDir, {recursive: true});
        this.git.run(['add', '-A'], {cwd: tmpRepoDir});
        const containsChanges =
          this.git.runGraceful(
            [
              'diff-index',
              '--quiet',
              '-I',
              '0\\.0\\.0-[a-f0-9]+',
              'HEAD',
              '--',
              '.',
              ...PATHS_TO_EXCLUDE.map((p) => `:(exclude)${p}`),
            ],
            {cwd: tmpRepoDir},
          ).status === 1;

        this.git.run(
          [
            'commit',
            '--allow-empty',
            '--author',
            this.commitAuthor,
            '-m',
            `"${this.snapshotCommitMessage.replace(/"/g, '\\"')}"`,
          ],
          {cwd: tmpRepoDir},
        );

        return {
          url,
          dir: tmpRepoDir,
          name: pkg.name,
          containsChanges,
        };
      }),
    );
  }

  /**
   * Publishes the snapshot repositories to GitHub.
   */
  async publishSnapshots(snapshots: SnapshotRepo[]): Promise<void> {
    Log.info(bold(`Publishing snapshots to GitHub...`));
    for (const {name, dir, url, containsChanges} of snapshots) {
      if (this.flags.skipNonAffectedSnapshots && !containsChanges) {
        Log.info(
          `  ${yellow('⚠')} Skipping snapshot publish for ${name} as no changes occurred between this and the previous commit.`,
        );
        continue;
      }

      if (this.flags.dryRun) {
        Log.info(
          `  ${green('✔')} Dry run: Publish package artifacts for ${name}#${this.commitSha} to ${url}#${this.branchName}`,
        );
      } else {
        this.git.run(
          [
            'push',
            addTokenToGitHttpsUrl(url, this.git.githubToken),
            '--force',
            '--',
            this.branchName,
          ],
          {cwd: dir},
        );
        Log.info(
          `  ${green('✔')} Published package artifacts for ${name}#${this.commitSha} to ${url}#${this.branchName}`,
        );
      }
    }
  }
}
