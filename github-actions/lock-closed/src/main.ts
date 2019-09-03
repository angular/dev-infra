import * as core from '@actions/core';
import * as github from '@actions/github';

async function lockIssue(client: github.GitHub, issue: number, message?: string): Promise<void> {
  // Add a comment before locking
  if (message) {
    await client.issues.createComment({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: issue,
      body: message,
    });
  }

  // Actually lock the issue
  await client.issues.lock({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue,
  });
}

async function run(): Promise<void> {
  try {
    // NOTE: `days` and `message` must not be changed without dev-rel and dev-infra concurrence

    // Fixed amount of days a closed issue must be inactive before being locked
    const days = 30;
    // Standardized Angular Team message for locking issues
    const policyUrl = 'https://github.com/angular/angular/blob/67d80f9ae8082d446e2d58227375f5a92eeae933/docs/GITHUB_PROCESS.md#conversation-locking';
    const message =
      'This issue has been automatically locked due to inactivity.\n' +
      'Please file a new issue if you are encountering a similar or related problem.\n\n' +
      `Read more about our [automatic conversation locking policy](${policyUrl}).\n\n` +
      '_This action has been performed automatically by a bot._';

    const maxPerExecution = Math.min(+core.getInput('locks-per-execution') || 1, 400);
    const repoToken = core.getInput('github-token', { required: true });
    const client = new github.GitHub(repoToken);

    // Set the threshold date based on the days inactive
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const repositoryName = github.context.repo.owner + '/' + github.context.repo.repo;
    const query = `repo:${repositoryName}+is:issue+is:closed+is:unlocked+updated:<${threshold.toISOString().split('T')[0]}+sort:updated-asc`;
    core.debug('Issue query: ' + query);

    let lockCount = 0;
    let issueResponse;
    while (!issueResponse || issueResponse.data.length > 0) {
      issueResponse = await client.search.issuesAndPullRequests({
        q: query,
        per_page: 100,
      });

      for (const issue of issueResponse.data) {
        ++lockCount;
        try {
          core.debug(`Locking issue #${issue.number}`);
          await lockIssue(client, issue.number, message);
        } catch (error) {
          core.debug(error);
          core.warning(`Unable to lock issue #${issue.number}: ${error.message}`);
          if (typeof error.request === 'object') {
            core.error(JSON.stringify(error.request, null, 2));
          }
        }

        // Limit lock actions per run to prevent notification spam and API rate-limit issues
        if (lockCount >= maxPerExecution) {
          return;
        }
      }
    }
  } catch (error) {
    core.debug(error);
    core.setFailed(error.message);
    if (typeof error.request === 'object') {
      core.error(JSON.stringify(error.request, null, 2));
    }
  }
}

run();
