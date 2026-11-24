/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig} from '../../utils/config.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {getCurrentMergeMode} from '../../utils/git/repository-merge-mode.js';
import {ReleaseConfig} from '../config/index.js';
import {ActiveReleaseTrains} from '../versioning/active-release-trains.js';
import {assertValidExitGateProject, ExitGateCommand} from '../versioning/exit-gate.js';
import {NpmCommand} from '../versioning/npm-command.js';
import {printActiveReleaseTrains} from '../versioning/print-active-trains.js';
import {getNextBranchName, ReleaseRepoWithApi} from '../versioning/version-branches.js';

import {ReleaseAction} from './actions.js';
import {ExternalCommands} from './external-commands.js';
import {
  FatalReleaseActionError,
  StageOnlySuccessError,
  UserAbortedReleaseActionError,
} from './actions-error.js';
import {actions} from './actions/index.js';
import {verifyNgDevToolIsUpToDate} from '../../utils/version-check.js';
import {green, Log, yellow} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';
import {setMergeModeRelease} from '../../caretaker/merge-mode/release.js';

export enum CompletionState {
  SUCCESS,
  FATAL_ERROR,
  MANUALLY_ABORTED,
}

/** A set of flags available to be used to override settings at runtime. */
export interface ReleaseToolFlags {
  publishRegistry?: string;
  exitGateProject?: string;
  stageOnly?: boolean;
}

export class ReleaseTool {
  /** The previous git commit to return back to after the release tool runs. */
  private previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
  /** The release configuration for the release tool run. */
  protected _config: ReleaseConfig;

  constructor(
    protected _git: AuthenticatedGitClient,
    config: ReleaseConfig,
    protected _github: GithubConfig,
    protected _projectRoot: string,
    protected _flags: ReleaseToolFlags,
  ) {
    if (_flags.publishRegistry !== undefined) {
      this._config = {
        ...config,
        // Explicitly passed `--publishRegistry` overrides config and bypasses OSS Exit Gate.
        publishRegistry: _flags.publishRegistry,
        exitGate: undefined,
      };
    } else if (_flags.exitGateProject !== undefined) {
      const projectName = assertValidExitGateProject(_flags.exitGateProject);
      this._config = {
        ...config,
        exitGate: {projectName},
        publishRegistry: undefined,
      };
    } else {
      this._config = {
        ...config,
      };
    }
  }

  /** Runs the interactive release tool. */
  async run(): Promise<CompletionState> {
    Log.info();
    Log.info(yellow('--------------------------------------------'));
    Log.info(yellow('  Angular Dev-Infra release staging script'));
    Log.info(yellow('--------------------------------------------'));
    Log.info();

    const {owner, name} = this._github;
    const nextBranchName = getNextBranchName(this._github);

    if (
      !(await this._verifyNoUncommittedChanges()) ||
      !(await this._verifyRunningFromNextBranch(nextBranchName)) ||
      !(await this._verifyNoShallowRepository()) ||
      !(await verifyNgDevToolIsUpToDate(this._projectRoot)) ||
      !(await this._verifyInReleaseMergeMode())
    ) {
      return CompletionState.FATAL_ERROR;
    }

    if (!this._flags.stageOnly && !(await this._verifyPublishAuthState())) {
      return CompletionState.MANUALLY_ABORTED;
    }

    // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
    // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
    // Running hooks has the downside of potentially running code (like the `ng-dev` tool) when a version
    // branch is checked out, but the node modules are not re-installed. The tool switches branches
    // multiple times per execution, and it is not desirable re-running Yarn all the time.
    process.env['HUSKY'] = '0';

    const repo: ReleaseRepoWithApi = {owner, name, api: this._git.github, nextBranchName};
    const releaseTrains = await ActiveReleaseTrains.fetch(repo);

    // Print the active release trains so that the caretaker can access
    // the current project branching state without switching context.
    await printActiveReleaseTrains(releaseTrains, this._config);

    const action = await this._promptForReleaseAction(releaseTrains);

    try {
      await action.perform();
    } catch (e) {
      if (e instanceof StageOnlySuccessError) {
        Log.info(green(`✓ Staging completed successfully. PR URL: ${e.pullRequest.url}`));
        return CompletionState.SUCCESS;
      }
      if (e instanceof UserAbortedReleaseActionError) {
        return CompletionState.MANUALLY_ABORTED;
      }
      // Only print the error message and stack if the error is not a known fatal release
      // action error (for which we print the error gracefully to the console with colors).
      if (!(e instanceof FatalReleaseActionError) && e instanceof Error) {
        console.error(e);
      }
      return CompletionState.FATAL_ERROR;
    } finally {
      await this.cleanup();
    }

    return CompletionState.SUCCESS;
  }

  /** Run post release tool cleanups. */
  private async cleanup(): Promise<void> {
    // Return back to the git state from before the release tool ran.
    this._git.checkout(this.previousGitBranchOrRevision, true);
    // Ensure we are back on the Node.js version expected by the original git state.
    await ExternalCommands.invokeNvmInstall(this._projectRoot, true);
    // Ensure log out of NPM when publishing directly to an NPM registry.
    if (!this._flags.stageOnly && !this._config.exitGate) {
      await NpmCommand.logout(this._config.publishRegistry);
    }
  }

  /** Prompts the caretaker for a release action that should be performed. */
  private async _promptForReleaseAction(activeTrains: ActiveReleaseTrains) {
    const choices: {name: string; value: ReleaseAction}[] = [];

    // Find and instantiate all release actions which are currently valid.
    for (let actionType of actions) {
      if (await actionType.isActive(activeTrains, this._config)) {
        const action: ReleaseAction = new actionType(
          activeTrains,
          this._git,
          this._config,
          this._projectRoot,
          this._flags.stageOnly,
        );
        choices.push({name: await action.getDescription(), value: action});
      }
    }

    Log.info('Please select the type of release you want to perform.');

    const releaseAction = await Prompt.select<ReleaseAction>({
      message: 'Please select an action:',
      choices,
    });

    return releaseAction;
  }

  /**
   * Verifies that there are no uncommitted changes in the project.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyNoUncommittedChanges(): Promise<boolean> {
    if (this._git.hasUncommittedChanges()) {
      Log.error('  ✘   There are changes which are not committed and should be discarded.');
      return false;
    }
    return true;
  }

  /**
   * Verifies that there are no uncommitted changes in the project.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyInReleaseMergeMode(): Promise<boolean> {
    if (this._github.requireReleaseModeForRelease !== true) {
      Log.debug('Skipping check for release mode before merge as the repository does not have');
      Log.debug('requireReleaseModeForRelease set to true in the GithubConfig.');
      return true;
    }
    const mode = await getCurrentMergeMode();
    if (mode !== 'release') {
      Log.warn(`  ⚠   The repository merge-mode is set to ${mode} but must be set to release`);
      Log.warn('      prior to publishing releases. You can set merge-mode for release using:');
      Log.warn('      ng-dev caretaker merge-mode release');
      if (
        await Prompt.confirm({
          message: 'Would you like to move into release mode now?',
          default: true,
        })
      ) {
        return setMergeModeRelease();
      }
      return false;
    }
    return true;
  }

  /**
   * Verifies that the local repository is not configured as shallow.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyNoShallowRepository(): Promise<boolean> {
    if (this._git.isShallowRepo()) {
      Log.error('  ✘   The local repository is configured as shallow.');
      Log.error(`      Please convert the repository to a complete one by syncing with upstream.`);
      Log.error(`      https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`);
      return false;
    }
    return true;
  }

  /**
   * Verifies that the next branch from the configured repository is checked out.
   * @returns a boolean indicating success or failure.
   */
  private async _verifyRunningFromNextBranch(nextBranchName: string): Promise<boolean> {
    const headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
    const {data} = await this._git.github.repos.getBranch({
      ...this._git.remoteParams,
      branch: this._git.mainBranchName,
    });

    if (headSha !== data.commit.sha) {
      Log.error('  ✘   Running release tool from an outdated local branch.');
      Log.error(`      Please make sure you are running from the "${nextBranchName}" branch.`);
      return false;
    }
    return true;
  }

  /**
   * Verifies that the user is authenticated for publishing (Google Cloud ADC when using
   * OSS Exit Gate, or NPM login for direct/custom NPM registry publishing).
   * @returns a boolean indicating whether the user is authenticated for publishing.
   */
  private async _verifyPublishAuthState(): Promise<boolean> {
    if (this._config.exitGate !== undefined) {
      if (await ExitGateCommand.checkAdcAuthenticated()) {
        Log.debug('Already authenticated with Google Cloud ADC for OSS Exit Gate.');
        return true;
      }
      Log.warn(
        '  ✘   Not currently authenticated with Google Cloud Application Default Credentials (ADC) ' +
          'for OSS Exit Gate.',
      );
      const shouldLogin = await Prompt.confirm({
        message:
          'Would you like to authenticate with Google Cloud (gcloud auth application-default login) now?',
      });
      if (shouldLogin) {
        Log.debug('Starting interactive Google Cloud ADC login.');
        try {
          await ExitGateCommand.startInteractiveAdcLogin();
        } catch (e) {
          Log.error(e);
          Log.error('  ✘   Failed to authenticate with Google Cloud ADC.');
          return false;
        }
        return true;
      }
      return false;
    }

    const registry = `NPM at the ${this._config.publishRegistry ?? 'default NPM'} registry`;
    if (await NpmCommand.checkIsLoggedIn(this._config.publishRegistry)) {
      Log.debug(`Already logged into ${registry}.`);
      return true;
    }
    Log.warn(`  ✘   Not currently logged into ${registry}.`);
    const shouldLogin = await Prompt.confirm({message: 'Would you like to log into NPM now?'});
    if (shouldLogin) {
      Log.debug('Starting NPM login.');
      try {
        await NpmCommand.startInteractiveLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    return false;
  }
}
