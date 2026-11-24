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
import {ExitGateCommand, assertValidExitGateProject} from '../versioning/exit-gate.js';
import {PublishCiTool} from '../../../github-actions/release/publish/lib/publish-ci.js';
import {Log} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';

/** Options for configuring the ReleaseRecoverCiPublishTool. */
export interface ReleaseRecoverCiPublishToolOptions {
  /** Whether to run in dry-run mode. */
  dryRun?: boolean;
  /** OSS Exit Gate project name (overrides `release.exitGate.projectName`). */
  exitGateProject?: string;
}

/**
 * Tool to recover a failed CI release publish run locally.
 *
 * Downloads the pre-built packages (.tgz) from a failed GitHub Actions run,
 * extracts them, and stages/triggers OSS Exit Gate locally using Google Cloud
 * Application Default Credentials (ADC).
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
    // 1. Resolve and validate OSS Exit Gate project name (fail fast)
    const rawExitGateProject =
      this.options.exitGateProject || this.releaseConfig.exitGate?.projectName;
    let exitGateProject: string | undefined;
    if (rawExitGateProject) {
      try {
        exitGateProject = assertValidExitGateProject(rawExitGateProject);
      } catch (e) {
        Log.error(`  ✘   ${e instanceof Error ? e.message : e}`);
        process.exitCode = 1;
        return;
      }
    } else if (!this.options.dryRun) {
      Log.error(
        'OSS Exit Gate project name is not defined. Configure `release.exitGate.projectName` or pass `--exit-gate-project`.',
      );
      process.exitCode = 1;
      return;
    }

    // 2. Verify Google Cloud ADC state (fail fast)
    if (!this.options.dryRun) {
      const adcOk = await this._verifyGcloudAdcState();
      if (!adcOk) {
        Log.error('  ✘   Google Cloud ADC authentication verification failed. Aborting recovery.');
        process.exitCode = 1;
        return;
      }
    }

    // Create temp directory for downloading and extracting artifacts
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'ng-dev-publish-recovery-'));
    Log.debug(`Created temp directory: ${tempDir}`);

    try {
      // 3. Fetch GHA Run Details
      Log.info(`Fetching workflow run details for run ID: ${this.runId}...`);
      const {data: run} = await this.git.github.rest.actions.getWorkflowRun({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.name,
        run_id: this.runId,
      });
      Log.info(`Found run: ${run.name} (Commit SHA: ${run.head_sha})`);

      // 4. Fetch Artifacts List
      Log.info('Fetching list of artifacts for this run...');
      const {data: artifactsData} = await this.git.github.rest.actions.listWorkflowRunArtifacts({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.name,
        run_id: this.runId,
      });

      const artifactName = 'release-packages';
      const artifact = artifactsData.artifacts.find((art: any) => art.name === artifactName);
      if (!artifact) {
        throw new Error(`Expected artifact "${artifactName}" not found in run ${this.runId}.`);
      }
      if (artifact.expired) {
        throw new Error(
          `Artifact "${artifactName}" (ID: ${artifact.id}) in run ${this.runId} has expired and can no longer be downloaded.`,
        );
      }

      // 5. Download Artifact ZIP
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

      // 6. Extract Artifact ZIP
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

      // 7. Publish via PublishCiTool
      Log.info('Initializing PublishCiTool for local publishing...');
      const tool = new PublishCiTool(
        {github: this.githubConfig, release: this.releaseConfig} as any,
        this.git,
        this.git.baseDir,
        {
          builtPackagesDir: extractDir,
          expectedSha: run.head_sha,
          exitGateProject,
          useApplicationDefaultCredentials: true,
          dryRun: this.options.dryRun,
          skipTagging: true,
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
      // 8. Cleanup
      Log.debug(`Cleaning up temp directory: ${tempDir}`);
      try {
        fs.rmSync(tempDir, {recursive: true, force: true});
      } catch (err) {
        Log.warn(`Warning: Could not remove temp directory ${tempDir}:`, err);
      }
    }
  }

  /** Verifies that the user is authenticated with Google Cloud ADC locally. */
  private async _verifyGcloudAdcState(): Promise<boolean> {
    if (await ExitGateCommand.checkAdcAuthenticated()) {
      Log.debug('Already authenticated with Google Cloud ADC.');
      return true;
    }

    Log.warn('  ✘   Not currently authenticated with Google Cloud ADC.');
    const shouldLogin = await Prompt.confirm({
      message:
        'Would you like to authenticate with Google Cloud (gcloud auth application-default login) now?',
    });
    if (shouldLogin) {
      try {
        await ExitGateCommand.startInteractiveAdcLogin();
        return true;
      } catch (e) {
        Log.error('Google Cloud ADC authentication failed:', e);
        return false;
      }
    }
    return false;
  }
}
