/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setTimeout as sleep} from 'node:timers/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PullRequest} from '../pull-request.js';
import {MergeStrategy, TEMP_PR_HEAD_BRANCH} from './strategy.js';
import {MergeConflictsFatalError} from '../failures.js';

/**
 * Merge strategy that does not use the Github API for merging. Instead, it fetches
 * all target branches and the PR locally. The PR is then cherry-picked with autosquash
 * enabled into the target branches. The benefit is the support for fixup and squash commits.
 * A notable downside though is that Github does not show the PR as `Merged` due to non
 * fast-forward merges.
 */
export class AutosquashMergeStrategy extends MergeStrategy {
  /**
   * Merges the specified pull request into the target branches and pushes the target
   * branches upstream. This method requires the temporary target branches to be fetched
   * already as we don't want to fetch the target branches per pull request merge. This
   * would causes unnecessary multiple fetch requests when multiple PRs are merged.
   *
   * @throws {GitCommandError} An unknown Git command error occurred that is not
   *   specific to the pull request merge.
   * @throws {FatalMergeToolError} A fatal error if the merge could not be performed.
   */
  override async merge(pullRequest: PullRequest): Promise<void> {
    const {
      githubTargetBranch,
      targetBranches,
      revisionRange,
      needsCommitMessageFixup,
      baseSha,
      prNumber,
    } = pullRequest;

    // We always rebase the pull request so that fixup or squash commits are automatically
    // collapsed. Git's autosquash functionality does only work in interactive rebases, so
    // our rebase is always interactive. In reality though, unless a commit message fixup
    // is desired, we set the `GIT_SEQUENCE_EDITOR` environment variable to `true` so that
    // the rebase seems interactive to Git, while it's not interactive to the user.
    // See: https://github.com/git/git/commit/891d4a0313edc03f7e2ecb96edec5d30dc182294.
    const branchOrRevisionBeforeRebase = this.git.getCurrentBranchOrRevision();
    const rebaseEnv = needsCommitMessageFixup
      ? undefined
      : {...process.env, GIT_SEQUENCE_EDITOR: 'true'};
    this.git.run(['rebase', '--interactive', '--autosquash', baseSha, TEMP_PR_HEAD_BRANCH], {
      stdio: 'inherit',
      env: rebaseEnv,
    });

    // Update pull requests commits to reference the pull request. This matches what
    // Github does when pull requests are merged through the Web UI. The motivation is
    // that it should be easy to determine which pull request contained a given commit.
    // Note: The filter-branch command relies on the working tree, so we want to make sure
    // that we are on the initial branch or revision where the merge script has been invoked.
    this.git.run(['checkout', '-f', branchOrRevisionBeforeRebase]);
    this.git.run([
      'filter-branch',
      '-f',
      '--msg-filter',
      `${getCommitMessageFilterScriptPath()} ${prNumber}`,
      revisionRange, // Range still captures the squashed commits (`base..PR_HEAD`).
    ]);

    // Perform the actual cherry picking into target branches.
    // Note: Range still captures the squashed commits (`base..PR_HEAD`).
    const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);

    // We already checked whether the PR can be cherry-picked into the target branches,
    // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
    // commits created through the Github API could be different (i.e. through squash).
    if (failedBranches.length) {
      throw new MergeConflictsFatalError(failedBranches);
    }

    // Push the cherry picked branches upstream.
    this.pushTargetBranchesUpstream(targetBranches);

    // Allow user to set an amount of time to wait to account for rate limiting of the token usage
    // during merge otherwise just waits 0 seconds.
    await sleep(parseInt(process.env['AUTOSQUASH_TIMEOUT'] || '0'));

    await this.createMergeComment(pullRequest, targetBranches);

    // For PRs which do not target the `main` branch on Github, Github does not automatically
    // close the PR when its commit is pushed into the repository. To ensure these PRs are
    // correctly marked as closed, we must detect this situation and close the PR via the API after
    // the upstream pushes are completed.
    if (githubTargetBranch !== this.git.mainBranchName) {
      await this.git.github.pulls.update({
        ...this.git.remoteParams,
        pull_number: pullRequest.prNumber,
        state: 'closed',
      });

      // When a pull request is merged, GitHub automatically closes any linked issues.
      // This is not the case when the pull request is not merged into the main branch.
      // This is why we need to manually close the linked issues.
      await this.closeLinkedIssues(pullRequest);
    }
  }
}

/** Gets the absolute file path to the commit-message filter script. */
function getCommitMessageFilterScriptPath(): string {
  // This file is getting bundled and ends up in `<pkg-root>/bundles/<chunk>`. We also
  // bundle the commit-message-filter script as another entry-point and can reference
  // it relatively as the path is preserved inside `bundles/`.
  // *Note*: Relying on package resolution is problematic within ESM and with `local-dev.sh`
  const bundlesDir = dirname(fileURLToPath(import.meta.url));
  return join(bundlesDir, './pr/merge/strategies/commit-message-filter.mjs');
}
