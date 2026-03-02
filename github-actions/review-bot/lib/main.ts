import * as core from '@actions/core';
import * as github from '@actions/github';
import {Octokit} from '@octokit/rest';
import {
  getPullRequestDiff,
  getModifiedFilesContext,
  getFailedChecks,
  postReviewComment,
} from './github.js';
import {performCodeReview} from './gemini.js';
import {ANGULAR_REVIEW_BOT, getAuthTokenFor} from '../../utils.js';

async function run(): Promise<void> {
  try {
    const geminiApiKey = core.getInput('gemini-api-key', {required: true});

    // Ensure we are running on a pull_request event
    const context = github.context;
    if (context.eventName !== 'pull_request') {
      core.info('This action only runs on pull_request events. Skipping.');
      return;
    }

    const token = await getAuthTokenFor(ANGULAR_REVIEW_BOT);
    const octokit = new Octokit({auth: token});

    const prNumber = context.payload.pull_request!.number;
    const repoOwner = context.repo.owner;
    const repoName = context.repo.repo;
    const headSha = context.payload.pull_request!.head.sha;

    core.info(`Starting code review for PR #${prNumber} at commit ${headSha}`);

    // Fetch required context from GitHub
    const diff = await getPullRequestDiff(octokit);
    const filesContext = await getModifiedFilesContext(octokit, headSha);
    const failedChecks = await getFailedChecks(octokit, headSha);

    if (!diff) {
      core.info('Could not retrieve a diff for this pull request. Skipping review.');
      return;
    }

    // Pass everything to Gemini to perform the review
    core.info('Calling Gemini for code review...');
    const reviewResult = await performCodeReview(
      geminiApiKey,
      diff,
      filesContext,
      failedChecks,
      octokit,
      repoOwner,
      repoName,
      headSha,
    );

    if (reviewResult) {
      core.info('Posting Gemini review comment to PR...');
      await postReviewComment(octokit, reviewResult);
      core.info('Review comment posted successfully.');
    } else {
      core.info('Gemini did not return a review comment.');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Action failed with error: ${error.message}`);
    } else {
      core.setFailed('Action failed with an unknown error');
    }
  }
}

run();
