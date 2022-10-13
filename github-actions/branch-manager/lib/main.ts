import * as core from '@actions/core';
import {context} from '@actions/github';
import {types, params } from 'typed-graphqlify';
import { fetchPullRequestFromGithub } from '../../../ng-dev/pr/common/fetch-pull-request.js';
import { actionLabels } from '../../../ng-dev/pr/common/labels.js';
import { PullRequestValidationConfig } from '../../../ng-dev/pr/common/validation/validation-config.js';
import { assertValidPullRequestConfig } from '../../../ng-dev/pr/config/index.js';
import { loadAndValidatePullRequest, PullRequest } from '../../../ng-dev/pr/merge/pull-request.js';
import { GithubApiMergeStrategy } from '../../../ng-dev/pr/merge/strategies/api-merge.js';
import { AutosquashMergeStrategy } from '../../../ng-dev/pr/merge/strategies/autosquash-merge.js';
import { assertValidGithubConfig, getConfig } from '../../../ng-dev/utils/config.js';
import { AuthenticatedGitClient } from '../../../ng-dev/utils/git/authenticated-git-client.js';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';

class BranchManager {
  /** Run the commit message based labelling process. */
  static run = async () => {
    const token = await getAuthTokenFor(ANGULAR_ROBOT, true);
    AuthenticatedGitClient.configure(token, "bot");
    try {
      const inst = new this();
      inst.git = await AuthenticatedGitClient.get();
      await inst.run();
    } finally {
      await revokeActiveInstallationToken(token);
    } 
  };

  private git!: AuthenticatedGitClient;

  private constructor() {}

  /** Run the action, and revoke the installation token on completion. */
  async run() {

    const config = await getConfig([assertValidGithubConfig, assertValidPullRequestConfig]);

    const prNumber = Number(core.getInput('pr', {trimWhitespace: true}));
    // An empty string coerced to a number is 0.
    if (prNumber === 0) {
      const {owner, name} = config.github;
      const results = await this.git.github.graphql<MERGE_READY_PR_QUEUE>(MERGE_READY_PR_QUEUE, {owner, name, mergeReadyLabel: [actionLabels.ACTION_MERGE.name]});
      const prs = results.repository.pullRequests.nodes.map(({number}) => number);
      core.setOutput('data', prs);
      core.info(`Triggering ${prs.length} prs to be evaluated`);
      return;
    }

    if (isNaN(prNumber)) {
      core.setFailed('The provided pr input value is not a number');
      return;
    }

    
    const prData = await fetchPullRequestFromGithub(this.git, prNumber);
    if (prData === null) {
      core.setFailed('Unable to find provided pull request on Github.');
      return;
    }


    let canMerge = true;
    try {
      const pullRequest = await loadAndValidatePullRequest({git: this.git, config} as any, prNumber, new PullRequestValidationConfig());
      if (pullRequest.validationFailures.length !== 0) {
        for (const failure of pullRequest.validationFailures) {
          await core.group('Validation failures', async () => {
            core.info(failure.message);
          });
        }
        canMerge = true;
      }
      if (!canMerge) {
        const strategy = config.pullRequest.githubApiMerge
        ? new GithubApiMergeStrategy(this.git, config.pullRequest.githubApiMerge)
        : new AutosquashMergeStrategy(this.git);
        await strategy.check(pullRequest)
      }
    } catch (e) {
      canMerge = false;
    }

    await this.git.github.repos.createCommitStatus({
      ...context.repo,
      sha: prData.headRefOid,
      state: canMerge ? 'success' : 'failure',
      context: 'branch-manager',
    });
  }
}

// Only run if the action is executed in a repository within the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'josephperrott') {
  BranchManager.run().catch((e: Error) => {
    core.error(e);
    core.setFailed(e.message);
  });
} else {}


const MERGE_READY_PR_QUEUE = params(
  {
    $owner: 'String!', // The organization to query for
    $name: 'String!', // The repository to query for
    $mergeReady: '[String!]', // The label used to indicate merge ready
  },
  {
    repository: params(
      {owner: '$owner', name: '$name'},
      {
        pullRequests: params(
          {
            first: 100,
            states: `OPEN`,
            labels: '$mergeReady',
          },
          {
            nodes: [{number: types.number,}],
            pageInfo: {
              hasNextPage: types.boolean,
              endCursor: types.string,
            },
            totalCount: types.number,
          },
        ),
      },
    ),
  },
);
type MERGE_READY_PR_QUEUE = typeof MERGE_READY_PR_QUEUE;