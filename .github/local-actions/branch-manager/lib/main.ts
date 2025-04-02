import * as core from '@actions/core';
import {context as actionContext} from '@actions/github';
import {loadAndValidatePullRequest} from '../../../../ng-dev/pr/merge/pull-request.js';
import {AutosquashMergeStrategy} from '../../../../ng-dev/pr/merge/strategies/autosquash-merge.js';
import {setupConfigAndGitClient} from './git.js';
import {cloneRepoIntoTmpLocation} from './tmp.js';
import {
  ANGULAR_ROBOT,
  getAuthTokenFor,
  revokeActiveInstallationToken,
} from '../../../../github-actions/utils.js';
import {MergeConflictsFatalError} from '../../../../ng-dev/pr/merge/failures.js';
import {createPullRequestValidationConfig} from '../../../../ng-dev/pr/common/validation/validation-config.js';

interface CommmitStatus {
  state: 'pending' | 'error' | 'failure' | 'success';
  description: string;
  targetUrl?: string;
}

/** The context name used for the commmit status applied. */
const statusContextName = 'mergeability';
/** The repository name for the pull request. */
const repo = core.getInput('repo', {required: true, trimWhitespace: true});
/** The owner of the repository for the pull request. */
const owner = core.getInput('owner', {required: true, trimWhitespace: true});
/** The pull request number. */
const pr = Number(core.getInput('pr', {required: true, trimWhitespace: true}));
// If the provided pr is not a number, we cannot evaluate the mergeability.
if (isNaN(pr)) {
  core.setFailed('The provided pr value was not a number');
  process.exit();
}
/** The token for the angular robot to perform actions in the requested repo. */
const token = await getAuthTokenFor(ANGULAR_ROBOT, {repo, owner});
const {
  /** The ng-dev configuration used for the environment */
  config,
  /** The Authenticated Git Client instance. */
  git,
} = await setupConfigAndGitClient(token, {owner, repo});
/** The sha of the latest commit on the pull request, which when provided is what triggered the check. */
const sha = await (async () => {
  let sha = core.getInput('sha', {required: false, trimWhitespace: true}) || undefined;
  if (sha === undefined) {
    sha = (await git.github.pulls.get({owner, repo, pull_number: pr})).data.head.sha as string;
  }
  return sha;
})();

/** Set the mergability status on the pull request provided in the environment. */
async function setMergeabilityStatusOnPullRequest({state, description, targetUrl}: CommmitStatus) {
  await git.github.repos.createCommitStatus({
    owner,
    repo,
    sha,
    context: statusContextName,
    state,
    // Status descriptions are limited to 140 characters.
    description: description.substring(0, 139),
    target_url: targetUrl,
  });
}

async function main() {
  try {
    // This is intentionally not awaited because we are just setting the status to pending, and wanting
    // to continue working.
    let _unawaitedPromise = setMergeabilityStatusOnPullRequest({
      state: 'pending',
      description: 'Mergability check in progress',
    });

    // Create a tmp directory to perform checks in and change working to directory to it.
    await cloneRepoIntoTmpLocation({owner, repo});

    /** The pull request after being retrieved and validated. */
    const pullRequest = await loadAndValidatePullRequest(
      {git, config},
      pr,
      createPullRequestValidationConfig({
        assertSignedCla: true,
        assertMergeReady: true,
        assertPending: false,
        assertChangesAllowForTargetLabel: false,
        assertPassingCi: false,
        assertCompletedReviews: false,
        assertEnforcedStatuses: false,
        assertMinimumReviews: false,
      }),
    );
    core.info('Validated PR information:');
    core.info(JSON.stringify(pullRequest, null, 2));
    /** Whether any fatal validation failures were discovered. */
    let hasFatalFailures = false;
    /** The status information to be pushed as a status to the pull request. */
    let statusInfo: CommmitStatus = await (async () => {
      // Log validation failures and check for any fatal failures.
      if (pullRequest.validationFailures.length !== 0) {
        core.info(`Found ${pullRequest.validationFailures.length} failing validation(s)`);
        await core.group('Validation failures', async () => {
          for (const failure of pullRequest.validationFailures) {
            hasFatalFailures = !failure.canBeForceIgnored || hasFatalFailures;
            core.info(failure.message);
          }
        });
      }

      // With any fatal failure the check is not necessary to do.
      if (hasFatalFailures) {
        core.info('One of the validations was fatal, setting the status as pending for the pr');
        return {
          description: 'Waiting to check until the pull request is ready',
          state: 'pending',
        };
      }

      try {
        git.run(['checkout', config.github.mainBranchName]);
        /**
         * A merge strategy used to perform the merge check.
         * Any concrete class implementing MergeStrategy is sufficient as all of our usage is
         * defined in the abstract base class.
         * */
        const strategy = new AutosquashMergeStrategy(git);
        await strategy.prepare(pullRequest);
        await strategy.check(pullRequest);
        core.info('Merge check passes, setting a passing status on the pr');
        return {
          description: `Merges cleanly to ${pullRequest.targetBranches.join(', ')}`,
          state: 'success',
        };
      } catch (e) {
        // As the merge strategy class will express the failures during checks, any thrown error is a
        // failure for our merge check.
        let description: string;
        if (e instanceof MergeConflictsFatalError) {
          core.info('Merge conflict found');
          const passingBranches = pullRequest.targetBranches.filter(
            (branch) => !e.failedBranches.includes(branch),
          );
          description = `Unable to merge into: ${e.failedBranches.join(', ')} | Can merge into: ${passingBranches.join(',')}`;
        } else {
          core.info('Unknown error found when checking merge:');
          core.error(e as Error);
          description =
            'Cannot cleanly merge to all target branches, please update changes or PR target';
        }
        return {
          description,
          state: 'failure',
        };
      }
    })();

    await setMergeabilityStatusOnPullRequest(statusInfo);
  } catch (e: Error | unknown) {
    let description: string;
    const {runId, repo, serverUrl} = actionContext;
    const targetUrl = `${serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${runId}`;
    if (e instanceof Error) {
      description = e.message;
    } else {
      description = 'Internal Error, see link for action log';
    }
    await setMergeabilityStatusOnPullRequest({
      state: 'error',
      description,
      targetUrl,
    });
    // Re-throw the error so that the action run is set as failing.
    throw e;
  }
}

try {
  await main().catch((e: Error) => {
    core.error(e);
    core.setFailed(e.message);
  });
} finally {
  await revokeActiveInstallationToken(token);
}
