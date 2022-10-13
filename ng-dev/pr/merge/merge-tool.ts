/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import semver from 'semver';
import inquirer from 'inquirer';
import {bold, green, Log, red, yellow} from '../../utils/logging.js';

import {PullRequestConfig} from '../config/index.js';
import {
  getCaretakerNotePromptMessage,
  getTargetedBranchesConfirmationPromptMessage,
  getTargetedBranchesMessage,
} from './messages.js';
import {loadAndValidatePullRequest, PullRequest} from './pull-request.js';
import {GithubApiMergeStrategy} from './strategies/api-merge.js';
import {AutosquashMergeStrategy} from './strategies/autosquash-merge.js';
import {GithubConfig, NgDevConfig} from '../../utils/config.js';
import {assertValidReleaseConfig} from '../../release/config/index.js';
import {
  ActiveReleaseTrains,
  fetchLongTermSupportBranchesFromNpm,
  getNextBranchName,
} from '../../release/versioning/index.js';
import {Prompt} from '../../utils/prompt.js';
import {FatalMergeToolError, UserAbortedMergeToolError} from './failures.js';
import {PullRequestValidationConfig} from '../common/validation/validation-config.js';
import {PullRequestValidationFailure} from '../common/validation/validation-failure.js';

export interface PullRequestMergeFlags {
  branchPrompt: boolean;
  forceManualBranches: boolean;
  dryRun: boolean;
}

const defaultPullRequestMergeFlags: PullRequestMergeFlags = {
  branchPrompt: true,
  forceManualBranches: false,
  dryRun: false,
};

/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export class MergeTool {
  private flags: PullRequestMergeFlags;
  private pullRequest: PullRequest | undefined;

  constructor(
    public config: NgDevConfig<{pullRequest: PullRequestConfig; github: GithubConfig}>,
    public git: AuthenticatedGitClient,
    private prNumber: number,
    private validationConfig: PullRequestValidationConfig,
    flags: Partial<PullRequestMergeFlags>,
  ) {
    // Update flags property with the provided flags values as patches to the default flag values.
    this.flags = {...defaultPullRequestMergeFlags, ...flags};
  }

  async prepare() {
    if (this.git.hasUncommittedChanges()) {
      throw new FatalMergeToolError(
        'Local working repository not clean. Please make sure there are ' +
          'no uncommitted changes.',
      );
    }

    if (this.git.isShallowRepo()) {
      throw new FatalMergeToolError(
        `Unable to perform merge in a local repository that is configured as shallow.\n` +
          `Please convert the repository to a complete one by syncing with upstream.\n` +
          `https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`,
      );
    }

    await this.confirmMergeAccess();
  }

  async validate() {
    this.pullRequest = await loadAndValidatePullRequest(this, this.prNumber, this.validationConfig);

    if (this.pullRequest.validationFailures.length > 0) {
      Log.error(`Pull request did not pass one or more validation checks. Error:`);

      for (const failure of this.pullRequest.validationFailures) {
        Log.error(` -> ${bold(failure.message)}`);
      }
      Log.info();
      if (this.pullRequest.validationFailures.find((failure) => !failure.canBeForceIgnored)) {
        Log.info(yellow(`All discovered validations are non-fatal and can be forcibly ignored.`));

        if (await Prompt.confirm('Do you want to forcibly ignore these validation failures?')) {
          return;
        }
      }

      throw this.pullRequest.validationFailures[0];
    }

    if (this.flags.forceManualBranches) {
      await this.updatePullRequestTargetedBranchesFromPrompt(this.pullRequest);
    }
  }

  /**
   * Merges the given pull request and pushes it upstream.
   */
  async merge(): Promise<void> {
    if (this.pullRequest === undefined) {
      throw new FatalMergeToolError('`merge()` method called before the pull request validation');
    }

    if (this.flags.dryRun) {
      Log.info(green(`  ✓  Exiting due to dry run mode.`));
      return;
    }

    // If the pull request has a caretaker note applied, raise awareness by prompting
    // the caretaker. The caretaker can then decide to proceed or abort the merge.
    if (
      this.pullRequest.hasCaretakerNote &&
      !(await Prompt.confirm(getCaretakerNotePromptMessage(this.pullRequest)))
    ) {
      throw new UserAbortedMergeToolError();
    }

    const strategy = this.config.pullRequest.githubApiMerge
      ? new GithubApiMergeStrategy(this.git, this.config.pullRequest.githubApiMerge)
      : new AutosquashMergeStrategy(this.git);

    // Branch or revision that is currently checked out so that we can switch back to
    // it once the pull request has been merged.
    const previousBranchOrRevision = this.git.getCurrentBranchOrRevision();

    // The following block runs Git commands as child processes. These Git commands can fail.
    // We want to capture these command errors and return an appropriate merge request status.
    try {
      // Run preparations for the merge (e.g. fetching branches).
      await strategy.prepare(this.pullRequest);

      // Print the target branches.
      Log.info();
      Log.info(getTargetedBranchesMessage(this.pullRequest));

      // Check for conflicts between the pull request and target branches.
      await strategy.check(this.pullRequest);

      Log.info();
      Log.info(green(`  ✓  Pull request can be merged into all target branches.`));
      Log.info();

      if (
        // In cases where manual branch targeting is used, the user already confirmed.
        !this.flags.forceManualBranches &&
        this.flags.branchPrompt &&
        !(await Prompt.confirm(getTargetedBranchesConfirmationPromptMessage()))
      ) {
        throw new UserAbortedMergeToolError();
      }

      // Perform the merge and pass-through potential failures.
      await strategy.merge(this.pullRequest);
      Log.info(green(`  ✓  Successfully merged the pull request: #${this.prNumber}`));
    } finally {
      // Switch back to the previous branch. We need to do this before deleting the temporary
      // branches because we cannot delete branches which are currently checked out.
      this.git.run(['checkout', '-f', previousBranchOrRevision]);

      await strategy.cleanup(this.pullRequest);
    }
  }

  /**
   * Modifies the pull request in place with new target branches based on user
   * selection from the available active branches.
   */
  private async updatePullRequestTargetedBranchesFromPrompt(
    pullRequest: PullRequest,
  ): Promise<void> {
    const {name: repoName, owner} = this.config.github;

    // Attempt to retrieve the active LTS branches to be included in the selection.
    let ltsBranches: {branchName: string; version: semver.SemVer}[] = [];
    try {
      assertValidReleaseConfig(this.config);
      const ltsBranchesFromNpm = await fetchLongTermSupportBranchesFromNpm(this.config.release);
      ltsBranches = ltsBranchesFromNpm.active.map(({name, version}) => ({
        branchName: name,
        version,
      }));
    } catch {
      Log.warn(
        'Unable to determine the active LTS branches as a release config is not set for this repo.',
      );
    }

    // Gather the current active release trains.
    const {latest, next, releaseCandidate} = await ActiveReleaseTrains.fetch({
      name: repoName,
      nextBranchName: getNextBranchName(this.config.github),
      owner,
      api: this.git.github,
    });

    // Collate the known active branches into a single list.
    const activeBranches: {branchName: string; version: semver.SemVer}[] = [
      next,
      latest,
      ...ltsBranches,
    ];
    if (releaseCandidate !== null) {
      // Since the next version will always be the primary github branch rather than semver, the RC
      // branch should be included as the second item in the list.
      activeBranches.splice(1, 0, releaseCandidate);
    }

    const {selectedBranches, confirm} = await inquirer.prompt([
      {
        type: 'checkbox',
        default: pullRequest.targetBranches,
        choices: activeBranches.map(({branchName, version}) => {
          return {
            checked: pullRequest.targetBranches.includes(branchName),
            value: branchName,
            short: branchName,
            name: `${branchName} (${version})${
              branchName === pullRequest.githubTargetBranch ? ' [Targeted via Github UI]' : ''
            }`,
          };
        }),
        message: 'Select branches to merge pull request into:',
        name: 'selectedBranches',
      },
      {
        type: 'confirm',
        default: false,
        message:
          red('!!!!!! WARNING !!!!!!!\n') +
          yellow(
            'Using manual branch selection disables protective checks provided by the merge ' +
              'tooling. This means that the merge tooling will not prevent changes which are not ' +
              'allowed for the targeted branches. Please proceed with caution.\n',
          ) +
          'Are you sure you would like to proceed with the selected branches?',
        name: 'confirm',
      },
    ]);

    if (confirm === false) {
      throw new UserAbortedMergeToolError();
    }

    // The Github Targeted branch must always be selected. It is not currently possible
    // to make a readonly selection in inquirer's checkbox.
    if (!selectedBranches.includes(pullRequest.githubTargetBranch)) {
      throw new FatalMergeToolError(
        `Pull Requests must merge into their targeted Github branch. If this branch (${pullRequest.githubTargetBranch}) ` +
          'should not be included, please change the targeted branch via the Github UI.',
      );
    }

    pullRequest.targetBranches = selectedBranches;
  }

  async confirmMergeAccess() {
    if (this.git.userType === 'user') {
      // Check whether the given Github token has sufficient permissions for writing
      // to the configured repository. If the repository is not private, only the
      // reduced `public_repo` OAuth scope is sufficient for performing merges.
      const hasOauthScopes = await this.git.hasOauthScopes((scopes, missing) => {
        if (!scopes.includes('repo')) {
          if (this.config.github.private) {
            missing.push('repo');
          } else if (!scopes.includes('public_repo')) {
            missing.push('public_repo');
          }
        }

        // Pull requests can modify Github action workflow files. In such cases Github requires us to
        // push with a token that has the `workflow` oauth scope set. To avoid errors when the
        // caretaker intends to merge such PRs, we ensure the scope is always set on the token before
        // the merge process starts.
        // https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
        if (!scopes.includes('workflow')) {
          missing.push('workflow');
        }
      });

      if (hasOauthScopes !== true) {
        throw new FatalMergeToolError(hasOauthScopes.error);
      }
      return;
    } else {
      // TODO(josephperrott): Find a way to check access of the installation without using a JWT.
      Log.debug('Assuming correct access because this a bot account.');
    }
  }
}
