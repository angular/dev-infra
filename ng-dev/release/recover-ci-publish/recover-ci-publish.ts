/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {GithubConfig} from '../../utils/config.js';
import {ReleaseConfig} from '../config/index.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {ChildProcess} from '../../utils/child-process.js';
import {NpmCommand} from '../versioning/npm-command.js';
import {PublishCiTool} from '../../../github-actions/release/publish/lib/publish-ci.js';
import {Log} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';

/** Options for configuring the ReleaseRecoverCiPublishTool. */
export interface ReleaseRecoverCiPublishToolOptions {
  /** Whether to run in dry-run mode. */
  dryRun?: boolean;
  /** NPM registry URL to publish packages to (overrides config). */
  publishRegistry?: string;
}

/**
 * Tool to recover a failed CI release publish run locally.
 *
 * Downloads the built packages (.tgz) from a failed GitHub Actions run,
 * extracts them, and publishes them locally using the user's Wombat token session.
 */
export class ReleaseRecoverCiPublishTool {
  constructor(
    private git: AuthenticatedGitClient,
    private releaseConfig: ReleaseConfig,
    private githubConfig: GithubConfig,
    private runId: number,
    private options: ReleaseRecoverCiPublishToolOptions = {},
  ) {}

  /** Runs the recovery process. */
  async run(): Promise<void> {
    const registry = this.options.publishRegistry ?? this.releaseConfig.publishRegistry;

    // 1. Verify NPM Login State (Fail fast)
    const loginOk = await this._verifyNpmLoginState(registry);
    if (!loginOk) {
      Log.error('  ✘   NPM login verification failed. Aborting recovery.');
      process.exitCode = 1;
      return;
    }

    // Create temp directory for downloading and extracting artifacts
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'ng-dev-publish-recovery-'));
    Log.debug(`Created temp directory: ${tempDir}`);

    try {
      // 2. Fetch GHA Run Details
      Log.info(`Fetching workflow run details for run ID: ${this.runId}...`);
      const {data: run} = await this.git.github.rest.actions.getWorkflowRun({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.name,
        run_id: this.runId,
      });
      Log.info(`Found run: ${run.name} (Commit SHA: ${run.head_sha})`);

      // 3. Fetch Artifacts List
      Log.info('Fetching list of artifacts for this run...');
      const {data: artifactsData} = await this.git.github.rest.actions.listWorkflowRunArtifacts({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.name,
        run_id: this.runId,
      });

      const artifactName = 'release-packages-tgz';
      const artifact = artifactsData.artifacts.find((art: any) => art.name === artifactName);
      if (!artifact) {
        throw new Error(`Expected artifact "${artifactName}" not found in run ${this.runId}.`);
      }

      // 4. Download Artifact ZIP
      Log.info(`Downloading artifact "${artifactName}" (ID: ${artifact.id})...`);
      const downloadResponse = await this.git.github.rest.actions.downloadArtifact({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.name,
        artifact_id: artifact.id,
        archive_format: 'zip',
      });

      // downloadArtifact returns an ArrayBuffer which we convert to a Buffer to write to disk.
      const buffer = Buffer.from(downloadResponse.data as ArrayBuffer);
      const zipPath = path.join(tempDir, 'artifacts.zip');
      fs.writeFileSync(zipPath, buffer);
      Log.info(`Downloaded artifact zip to ${zipPath}`);

      // 5. Extract Artifact ZIP
      const extractDir = path.join(tempDir, 'extracted');
      fs.mkdirSync(extractDir, {recursive: true});
      Log.info(`Extracting packages to ${extractDir}...`);

      try {
        // Spawn native unzip utility
        await ChildProcess.spawn('unzip', [zipPath, '-d', extractDir], {mode: 'silent'});
      } catch (err: any) {
        if (err && err.code === 'ENOENT') {
          throw new Error(
            `Failed to execute 'unzip'. Please ensure that the 'unzip' utility is installed and available in your PATH.`,
          );
        }
        throw new Error(`Failed to extract packages zip artifact: ${err}`);
      }
      Log.info('Packages extracted successfully.');

      // 6. Publish via PublishCiTool
      Log.info('Initializing PublishCiTool for local publishing...');
      const tool = new PublishCiTool(
        {github: this.githubConfig, release: this.releaseConfig} as any,
        this.git,
        this.git.baseDir, // Project root directory where local package.json / git is located
        {
          builtPackagesDir: extractDir,
          expectedSha: run.head_sha,
          useLocalNpmConfig: true, // Bypasses GHA Wombat token check, uses local configuration
          dryRun: this.options.dryRun,
          skipTagging: true, // Tagging should be done in GHA, only recover publishing
        },
      );

      Log.info('Starting local publishing of recovered packages...');
      await tool.run();
      Log.info('Local recovery publishing completed.');
    } catch (e) {
      Log.error('  ✘   An error occurred during recovery:');
      Log.error(e);
      process.exitCode = 1;
    } finally {
      // 7. Cleanup
      Log.debug(`Cleaning up temp directory: ${tempDir}`);
      try {
        fs.rmSync(tempDir, {recursive: true, force: true});
      } catch (err) {
        Log.warn(`Warning: Could not remove temp directory ${tempDir}:`, err);
      }
    }
  }

  /** Verifies that the user is logged into NPM locally. */
  private async _verifyNpmLoginState(registry: string | undefined): Promise<boolean> {
    const registryName = `NPM at the ${registry ?? 'default NPM'} registry`;

    if (registry?.includes('wombat-dressing-room.appspot.com')) {
      Log.info('Unable to determine NPM login state for Wombat proxy, requiring login now.');
      try {
        await NpmCommand.startInteractiveLogin(registry);
      } catch {
        return false;
      }
      return true;
    }

    if (await NpmCommand.checkIsLoggedIn(registry)) {
      Log.debug(`Already logged into ${registryName}.`);
      return true;
    }

    Log.warn(`  ✘   Not currently logged into ${registryName}.`);
    const shouldLogin = await Prompt.confirm({message: 'Would you like to log into NPM now?'});
    if (shouldLogin) {
      try {
        await NpmCommand.startInteractiveLogin(registry);
        return true;
      } catch (e) {
        Log.error('NPM login failed:', e);
        return false;
      }
    }
    return false;
  }
}
