/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListChoiceOptions, prompt} from 'inquirer';

import {GithubConfig} from '../../utils/config.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {ReleaseConfig} from '../config/index.js';
import {ActiveReleaseTrains} from '../versioning/active-release-trains.js';
import {NpmCommand} from '../versioning/npm-command.js';
import {printActiveReleaseTrains} from '../versioning/print-active-trains.js';
import {getNextBranchName, ReleaseRepoWithApi} from '../versioning/version-branches.js';

import {ReleaseAction} from './actions.js';
import {FatalReleaseActionError, UserAbortedReleaseActionError} from './actions-error.js';
import {actions} from './actions/index.js';
import {verifyNgDevToolIsUpToDate} from '../../utils/version-check.js';
import {Log, yellow} from '../../utils/logging.js';
import {Prompt} from '../../utils/prompt.js';

export enum CompletionState {
  SUCCESS,
  FATAL_ERROR,
  MANUALLY_ABORTED,
}

export class ReleaseTool {
  /** The previous git commit to return back to after the release tool runs. */
  private previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();

  constructor(
    protected _git: AuthenticatedGitClient,
    protected _config: ReleaseConfig,
    protected _github: GithubConfig,
    protected _projectRoot: string,
  ) {}

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
      !(await verifyNgDevToolIsUpToDate(this._projectRoot))
    ) {
      return CompletionState.FATAL_ERROR;
    }

    if (!(await this._verifyNpmLoginState())) {
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
    // Ensure log out of NPM.
    await NpmCommand.logout(this._config.publishRegistry);
  }

  /** Prompts the caretaker for a release action that should be performed. */
  private async _promptForReleaseAction(activeTrains: ActiveReleaseTrains) {
    const choices: ListChoiceOptions[] = [];

    // Find and instantiate all release actions which are currently valid.
    for (let actionType of actions) {
      if (await actionType.isActive(activeTrains, this._config)) {
        const action: ReleaseAction = new actionType(
          activeTrains,
          this._git,
          this._config,
          this._projectRoot,
        );
        choices.push({name: await action.getDescription(), value: action});
      }
    }

    Log.info('Please select the type of release you want to perform.');

    const {releaseAction} = await prompt<{releaseAction: ReleaseAction}>({
      name: 'releaseAction',
      message: 'Please select an action:',
      type: 'list',
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
   * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
   * @returns a boolean indicating whether the user is logged into NPM.
   */
  private async _verifyNpmLoginState(): Promise<boolean> {
    const registry = `NPM at the ${this._config.publishRegistry ?? 'default NPM'} registry`;
    // TODO(josephperrott): remove wombat specific block once wombot allows `npm whoami` check to
    // check the status of the local token in the .npmrc file.
    if (this._config.publishRegistry?.includes('wombat-dressing-room.appspot.com')) {
      Log.info('Unable to determine NPM login state for wombat proxy, requiring login now.');
      try {
        await NpmCommand.startInteractiveLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    if (await NpmCommand.checkIsLoggedIn(this._config.publishRegistry)) {
      Log.debug(`Already logged into ${registry}.`);
      return true;
    }
    Log.warn(`  ✘   Not currently logged into ${registry}.`);
    const shouldLogin = await Prompt.confirm('Would you like to log into NPM now?');
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
