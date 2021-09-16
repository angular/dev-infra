/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ListChoiceOptions, prompt} from 'inquirer';
import {GithubConfig} from '../../utils/config';
import {debug, error, info, log, promptConfirm, red, yellow} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {ReleaseConfig} from '../config/index';
import {ActiveReleaseTrains, fetchActiveReleaseTrains} from '../versioning/active-release-trains';
import {npmIsLoggedIn, npmLogin, npmLogout} from '../versioning/npm-publish';
import {printActiveReleaseTrains} from '../versioning/print-active-trains';
import {getNextBranchName, ReleaseRepoWithApi} from '../versioning/version-branches';

import {ReleaseAction} from './actions';
import {FatalReleaseActionError, UserAbortedReleaseActionError} from './actions-error';
import {actions} from './actions/index';

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
    log();
    log(yellow('--------------------------------------------'));
    log(yellow('  Angular Dev-Infra release staging script'));
    log(yellow('--------------------------------------------'));
    log();

    const {owner, name} = this._github;
    const nextBranchName = getNextBranchName(this._github);

    if (
      !(await this._verifyNoUncommittedChanges()) ||
      !(await this._verifyRunningFromNextBranch(nextBranchName)) ||
      !(await this._verifyNoShallowRepository())
    ) {
      return CompletionState.FATAL_ERROR;
    }

    if (!(await this._verifyNpmLoginState())) {
      return CompletionState.MANUALLY_ABORTED;
    }

    const repo: ReleaseRepoWithApi = {owner, name, api: this._git.github, nextBranchName};
    const releaseTrains = await fetchActiveReleaseTrains(repo);

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
    await npmLogout(this._config.publishRegistry);
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

    info('Please select the type of release you want to perform.');

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
      error(red('  ✘   There are changes which are not committed and should be discarded.'));
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
      error(red('  ✘   The local repository is configured as shallow.'));
      error(red(`      Please convert the repository to a complete one by syncing with upstream.`));
      error(
        red(`      https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`),
      );
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
      error(red('  ✘   Running release tool from an outdated local branch.'));
      error(red(`      Please make sure you are running from the "${nextBranchName}" branch.`));
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
      info('Unable to determine NPM login state for wombat proxy, requiring login now.');
      try {
        await npmLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    if (await npmIsLoggedIn(this._config.publishRegistry)) {
      debug(`Already logged into ${registry}.`);
      return true;
    }
    error(red(`  ✘   Not currently logged into ${registry}.`));
    const shouldLogin = await promptConfirm('Would you like to log into NPM now?');
    if (shouldLogin) {
      debug('Starting NPM login.');
      try {
        await npmLogin(this._config.publishRegistry);
      } catch {
        return false;
      }
      return true;
    }
    return false;
  }
}
