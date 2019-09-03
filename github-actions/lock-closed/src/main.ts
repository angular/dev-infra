import * as core from '@actions/core';
import { context } from '@actions/github';
import Octokit from '@octokit/rest';
import * as jwt from 'jsonwebtoken';

async function lockIssue(client: Octokit, issue: number, message?: string): Promise<void> {
  // Add a comment before locking
  if (message) {
    await client.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issue,
      body: message,
    });
  }

  // Actually lock the issue
  await client.issues.lock({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue,
  });
}

/** Creates a JWT token expiring one hour in the future, for authentication as an installation (Github App). */
function createJWT(privateKey: string, id: number) {
  const now = Date.now() / 1000;

  return jwt.sign(
    {
      // Issued at time
      iat: now,
      // JWT expiration time (60 minutes in the future)
      exp: now + 60 * 60,
      // Installation (Githup App) id
      iss: id,
    },
    privateKey,
    {
      algorithm: 'RS256',
    },
  );
}

async function run(): Promise<void> {
  try {
    // NOTE: `days` and `message` must not be changed without dev-rel and dev-infra concurrence

    // Fixed amount of days a closed issue must be inactive before being locked
    const days = 30;
    // Standardized Angular Team message for locking issues
    const policyUrl =
      'https://com/angular/angular/blob/67d80f9ae8082d446e2d58227375f5a92eeae933/docs/GITHUB_PROCESS.md#conversation-locking';
    const message =
      'This issue has been automatically locked due to inactivity.\n' +
      'Please file a new issue if you are encountering a similar or related problem.\n\n' +
      `Read more about our [automatic conversation locking policy](${policyUrl}).\n\n` +
      '<sub>_This action has been performed automatically by a bot._</sub>';
    // Installation Id of the Lock Bot App
    const lockBotAppId = 1770828;

    // Create unauthenticated Github client.
    const client = new Octokit();

    // Create JWT Token with provided private key.
    const lockBotKey = core.getInput('lock-bot-key', { required: true });
    const lockBotJWT = createJWT(lockBotKey, lockBotAppId);

    // Create Installation Token using JWT Token
    client.authenticate({
      type: 'app',
      token: lockBotJWT,
    });
    const installToken = await client.apps.createInstallationToken({
      installation_id: lockBotAppId,
    });

    // Authenticate using as `angular-automatic-lock-bot` Github App Installation Token
    client.authenticate({
      type: 'token',
      token: installToken.data.token,
    });

    const maxPerExecution = Math.min(+core.getInput('locks-per-execution') || 1, 400);
    // Set the threshold date based on the days inactive
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const repositoryName = context.repo.owner + '/' + context.repo.repo;
    const query = `repo:${repositoryName}+is:issue+is:closed+is:unlocked+updated:<${
      threshold.toISOString().split('T')[0]
    }+sort:updated-asc`;
    core.debug('Issue query: ' + query);

    let lockCount = 0;
    let issueResponse;
    while (!issueResponse || issueResponse.data.length > 0) {
      issueResponse = await client.search.issuesAndPullRequests({
        q: query,
        per_page: 100,
      });

      for (const issue of issueResponse.data.items) {
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
