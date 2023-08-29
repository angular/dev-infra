import * as core from '@actions/core';
import {PullRequestValidationConfig} from '../../../../ng-dev/pr/common/validation/validation-config.js';
import {
  assertValidPullRequestConfig,
  PullRequestConfig,
} from '../../../../ng-dev/pr/config/index.js';
import {loadAndValidatePullRequest} from '../../../../ng-dev/pr/merge/pull-request.js';
import {AutosquashMergeStrategy} from '../../../../ng-dev/pr/merge/strategies/autosquash-merge.js';
import {
  assertValidGithubConfig,
  getConfig,
  GithubConfig,
  setConfig,
} from '../../../../ng-dev/utils/config.js';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {
  ANGULAR_ROBOT,
  getAuthTokenFor,
  revokeActiveInstallationToken,
} from '../../../../github-actions/utils.js';
import {MergeConflictsFatalError} from '../../../../ng-dev/pr/merge/failures.js';
import {chdir} from 'process';
import {spawnSync} from 'child_process';

interface CommmitStatus {
  state: 'pending' | 'error' | 'failure' | 'success';
  description: string;
}

/** The directory name for the temporary repo used for validation. */
const tempRepo = 'branch-mananger-repo';
/** The context name used for the commmit status applied. */
const statusContextName = 'mergeability';
/** The branch used as the primary branch for the temporary repo. */
const mainBranchName = 'main';

async function main(repo: {owner: string; repo: string}, token: string, pr: number) {
  // Because we want to perform this check in the targetted repository, we first need to check out the repo
  // and then move to the directory it is cloned into.
  chdir('/tmp');
  console.log(
    spawnSync('git', [
      'clone',
      '--depth=1',
      `https://github.com/${repo.owner}/${repo.repo}.git`,
      `./${tempRepo}`,
    ]).output.toString(),
  );
  chdir(`/tmp/${tempRepo}`);

  // Manually define the configuration for the pull request and github to prevent having to
  // checkout the repository before defining the config.
  // TODO(josephperrott): Load this from the actual repository.
  setConfig(<{pullRequest: PullRequestConfig; github: GithubConfig}>{
    github: {
      mainBranchName,
      owner: repo.owner,
      name: repo.repo,
    },
    pullRequest: {
      githubApiMerge: false,
    },
  });
  /** The configuration used for the ng-dev tooling. */
  const config = await getConfig([assertValidGithubConfig, assertValidPullRequestConfig]);

  AuthenticatedGitClient.configure(token);
  /** The git client used to perform actions. */
  const git = await AuthenticatedGitClient.get();

  /** The pull request after being retrieved and validated. */
  const pullRequest = await loadAndValidatePullRequest(
    {git, config},
    pr,
    PullRequestValidationConfig.create({
      assertPending: false,
      assertCompletedReviews: false,
    }),
  );
  core.info('Validated PR information:');
  core.info(JSON.stringify(pullRequest));
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
      git.run(['checkout', mainBranchName]);
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
        description = `Unable to merge into: ${e.failedBranches.join(', ')}`;
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

  await git.github.repos.createCommitStatus({
    ...repo,
    state: statusInfo.state,
    // Status descriptions are limited to 140 characters.
    description: statusInfo.description.substring(0, 139),
    sha: pullRequest.headSha,
    context: statusContextName,
  });
}

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

try {
  await main({repo, owner}, token, pr).catch((e: Error) => {
    core.error(e);
    core.setFailed(e.message);
  });
} finally {
  await revokeActiveInstallationToken(token);
}
