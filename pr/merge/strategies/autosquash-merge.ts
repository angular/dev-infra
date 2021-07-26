import {join} from 'path';
import {PullRequestFailure} from '../failures';
import {PullRequest} from '../pull-request';
import {MergeStrategy, TEMP_PR_HEAD_BRANCH} from './strategy';

/** Path to the commit message filter script. Git expects this paths to use forward slashes. */
const MSG_FILTER_SCRIPT = join(__dirname, './commit-message-filter.js').replace(/\\/g, '/');

/**
 * Merge strategy that does not use the Github API for merging. Instead, it fetches
 * all target branches and the PR locally. The PR is then cherry-picked with autosquash
 * enabled into the target branches. The benefit is the support for fixup and squash commits.
 * A notable downside though is that Github does not show the PR as `Merged` due to non
 * fast-forward merges
 */
export class AutosquashMergeStrategy extends MergeStrategy {
  /**
   * Merges the specified pull request into the target branches and pushes the target
   * branches upstream. This method requires the temporary target branches to be fetched
   * already as we don't want to fetch the target branches per pull request merge. This
   * would causes unnecessary multiple fetch requests when multiple PRs are merged.
   * @throws {GitCommandError} An unknown Git command error occurred that is not
   *   specific to the pull request merge.
   * @returns A pull request failure or null in case of success.
   */
  async merge(pullRequest: PullRequest): Promise<PullRequestFailure|null> {
    const {prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup} = pullRequest;
    // In case a required base is specified for this pull request, check if the pull
    // request contains the given commit. If not, return a pull request failure. This
    // check is useful for enforcing that PRs are rebased on top of a given commit. e.g.
    // a commit that changes the codeowner ship validation. PRs which are not rebased
    // could bypass new codeowner ship rules.
    if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
      return PullRequestFailure.unsatisfiedBaseSha();
    }

    // Git revision range that matches the pull request commits.
    const revisionRange = this.getPullRequestRevisionRange(pullRequest);
    // Git revision for the first commit the pull request is based on.
    const baseRevision = this.getPullRequestBaseRevision(pullRequest);

    // By default, we rebase the pull request so that fixup or squash commits are
    // automatically collapsed. Optionally, if a commit message fixup is needed, we
    // make this an interactive rebase so that commits can be selectively modified
    // before the merge completes.
    const branchBeforeRebase = this.git.getCurrentBranch();
    const rebaseArgs = ['--autosquash', baseRevision, TEMP_PR_HEAD_BRANCH];
    if (needsCommitMessageFixup) {
      this.git.run(['rebase', '--interactive', ...rebaseArgs], {stdio: 'inherit'});
    } else {
      this.git.run(['rebase', ...rebaseArgs]);
    }

    // Update pull requests commits to reference the pull request. This matches what
    // Github does when pull requests are merged through the Web UI. The motivation is
    // that it should be easy to determine which pull request contained a given commit.
    // **Note**: The filter-branch command relies on the working tree, so we want to make
    // sure that we are on the initial branch where the merge script has been run.
    this.git.run(['checkout', '-f', branchBeforeRebase]);
    this.git.run(
        ['filter-branch', '-f', '--msg-filter', `${MSG_FILTER_SCRIPT} ${prNumber}`, revisionRange]);

    // Cherry-pick the pull request into all determined target branches.
    const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);

    if (failedBranches.length) {
      return PullRequestFailure.mergeConflicts(failedBranches);
    }

    this.pushTargetBranchesUpstream(targetBranches);
    return null;
  }
}
