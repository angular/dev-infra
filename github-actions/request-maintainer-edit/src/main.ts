import * as core from '@actions/core';
import { context } from '@actions/github';
import Octokit, { IssuesListCommentsResponseItem } from '@octokit/rest';
import {WebhookPayloadPullRequest} from '@octokit/webhooks'

const TRIGGER_ACTIONS = ['opened', 'synchronize'];

const BODY = 'some string';

/** Add comment to the PR asking the user to allow edit access for maintainers. */
async function commentOnPr(client: Octokit, prNumber: number, body: string): Promise<void> {
  await client.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body,
  });
}

/**
 * Delete the request comment, used to delete outdated/obsolete comments about requesting
 * access.
 */
async function deleteComment(client: Octokit, comment_id: number): Promise<void> {
  await client.issues.deleteComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id,
  });
}

/** Retrieve all of the current comments for the PR. */
async function getCurrentComments(client: Octokit, prNumber: number) {
  //return await client.paginate(
  return (await client.issues.listComments({
    issue_number: prNumber,
    per_page: 100,
    repo: context.repo.repo,
    owner: context.repo.owner,
  })).data;
  //, pages => (pages as any).data) as IssuesListCommentsResponseItem[]
}

/** Get the comment containing the request for edit access for maintainers. */
async function getRequestComment(client: Octokit, prNumber: number, body: string) {
  const comments = await getCurrentComments(client, prNumber);

  return comments.find(comment => comment.body === body);
}


async function run(): Promise<void> {
  // If the triggering event is not for a pull request or is not one of the actions
  // used as a trigger, exit early.
  if (context.eventName !== 'pull_request') {
    console.log('not the right event type', context.eventName);
    return;
  }

  // The event payload for the Pull Request event.
  const pullRequestPayload = context.payload as WebhookPayloadPullRequest;

  if (!TRIGGER_ACTIONS.includes(pullRequestPayload.action)) {
    console.log('bad action type', pullRequestPayload.action);
    return;
  }


  // The Pull Request object.
  const pullRequest = pullRequestPayload.pull_request;
  // The Github API client.
  let client: Octokit = new Octokit({auth: core.getInput('github-token')});
  // The comment on the Pull Request, requesting edit access for maintainers,
  // undefined if the comment does not exist.
  const requestComment = await getRequestComment(client, pullRequest.number, BODY)

  // If the PR is allows edit access for maintainers and an outstanding comment
  // exists asking for this access, delete the comment.
  if (pullRequest.maintainer_can_modify && requestComment) {
    console.log('deleting comment');
    await deleteComment(client, requestComment.id);
    return;
  }

  // If the PR does not allow edit access for maintainers and a comment requesting
  // access does not yet exist, add a comment making this request.
  if (!pullRequest.maintainer_can_modify && !requestComment) {
    console.log('commentting');
    await commentOnPr(client, pullRequest.number, BODY);
  }
}

console.log('starting');
run();
console.log('ending');
