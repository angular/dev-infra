import * as core from '@actions/core';
import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';
import {
  ANGULAR_ROBOT,
  getAuthTokenFor,
  revokeActiveInstallationToken,
} from '../../../../github-actions/utils.js';

const STALE_DAYS = 28;

export async function closeStaleDraftPrs(github: Octokit, repo: string): Promise<void> {
  const message = `This draft PR is being closed because it has been stale for ${STALE_DAYS} days and has seen no activity from you. If you'd like to see this change land, you can re-open this PR. Thank you for being an Angular contributor!`;

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - STALE_DAYS);
  const thresholdIso = threshold.toISOString();

  const repositoryName = `${context.repo.owner}/${repo}`;
  const query = `repo:${repositoryName} is:pr is:draft is:open updated:<${thresholdIso} sort:updated-asc`;
  core.info('Stale Draft PR Query: ' + query);

  let closeCount = 0;
  // We look at 100 at a time to avoid handling too many PRs in one go.
  // With each batch of 100 we'll eventually burn down the list of all stale draft PRs.
  const prResponse = await github.search.issuesAndPullRequests({
    q: query,
    per_page: 100,
  });

  core.info(`Stale Draft PR Query found ${prResponse.data.total_count} items`);

  if (!prResponse.data.items.length) {
    core.info(`No draft PRs to close`);
    return;
  }

  core.info(`Attempting to close up to ${prResponse.data.items.length} draft PR(s)`);
  core.startGroup('Closing stale draft PRs');

  for (const item of prResponse.data.items) {
    if (!item.pull_request) continue;

    try {
      await github.request('POST /graphql', {
        query: `
          mutation CloseStalePR($id: ID!, $body: String!) {
            addComment(input: {subjectId: $id, body: $body}) {
              clientMutationId
            }
            closePullRequest(input: {pullRequestId: $id}) {
              pullRequest {
                state
              }
            }
          }
        `,
        variables: {
          id: item.node_id,
          body: message,
        },
      });

      ++closeCount;
    } catch (error: unknown) {
      const e = error as Error & {request?: unknown};
      core.warning(`Unable to close draft PR ${repositoryName}#${item.number}: ${e.message}`);
      if (typeof e.request === 'object') {
        core.error(JSON.stringify(e.request, null, 2));
      }
    }
  }

  core.endGroup();
  core.info(`Closed ${closeCount} stale draft PR(s)`);
}

async function main() {
  const github = new Octokit({auth: await getAuthTokenFor(ANGULAR_ROBOT)});
  try {
    const repos = core.getMultilineInput('repos', {required: true, trimWhitespace: true});
    await core.group('Repos being cleaned:', async () =>
      repos.forEach((repo) => core.info(`- ${repo}`)),
    );
    for (const repo of repos) {
      await closeStaleDraftPrs(github, repo);
    }
  } catch (error: any) {
    core.debug(error.message);
    core.setFailed(error.message);
  } finally {
    await revokeActiveInstallationToken(github);
  }
}

main().catch((err) => {
  console.error(err);
  core.setFailed('Failed with the above error');
});
