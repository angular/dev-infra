/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {red, bold, green, magenta, yellow} from '../../utils/logging.js';

import {PullRequestCommentsFromGithub} from '../common/fetch-pull-request.js';
import {PullRequest} from './pull-request.js';

/**
 * Result of attempting to merge a pull request in batch mode.
 */
export interface PullRequestMergeResult {
  prNumber: number;
  status: 'success' | 'failed';
  targetBranches?: string[];
  failureReason?: string;
}

/** Regular expression matching comments that begin with caretaker note prefixes. */
export const CARETAKER_NOTE_COMMENT_REGEX =
  /^\s*(?:[*_#\[(]+\s*)?(?:caretakers?(?:[\s-]*(?:notes?|\(notes?\)))?|notes?\s+(?:for|to)\s+caretakers?)(?:\s*[\])])?(?:\*{1,2}|_{1,2})?\s*[:"]/i;

/**
 * Searches the comments on a pull request for a single comment matching the caretaker note prefix.
 * Only comments from trusted authors (OWNER, MEMBER, or COLLABORATOR) are considered.
 * Returns the comment body if exactly one matching comment is found, or null otherwise.
 */
export function getCaretakerNoteFromComments(
  comments: PullRequestCommentsFromGithub[],
): string | null {
  const matchingComments = comments.filter(
    (c) =>
      !!c.bodyText &&
      (c.authorAssociation === 'OWNER' ||
        c.authorAssociation === 'MEMBER' ||
        c.authorAssociation === 'COLLABORATOR') &&
      CARETAKER_NOTE_COMMENT_REGEX.test(c.bodyText),
  );

  if (matchingComments.length === 1) {
    return matchingComments[0].bodyText;
  }

  return null;
}

/** Formats a comment string as a quoted block for the CLI. */
export function getQuotedComment(comment: string): string {
  return comment
    .trim()
    .split(/\r?\n/)
    .map((line) => (line.length > 0 ? `> ${line}` : '>'))
    .join('\n');
}

export function getCaretakerNotePromptMessage(
  pullRequest: PullRequest,
  caretakerNote: string | undefined = pullRequest.caretakerNote,
): string {
  if (caretakerNote) {
    return (
      red('Pull request has a caretaker note applied. Please make sure you read it:') +
      `\n\n${magenta(getQuotedComment(caretakerNote))}\n\nDo you want to proceed merging?`
    );
  }
  return (
    red('Pull request has a caretaker note applied. Please make sure you read it.') +
    `\nQuick link to PR: ${pullRequest.url}\nDo you want to proceed merging?`
  );
}

export function getTargetedBranchesConfirmationPromptMessage(): string {
  return `Do you want to proceed merging?`;
}

export function getTargetedBranchesMessage(pullRequest: PullRequest): string {
  const targetBranchListAsString = pullRequest.targetBranches
    .map((b) => `  - ${bold(b)}`)
    .join('\n');
  return `Pull Request #${pullRequest.prNumber} will merge into:\n${targetBranchListAsString}`;
}

/**
 * Formats a caretaker note for presentation in the pull request summary.
 * Strips known caretaker note prefixes (e.g. "caretaker note:") to avoid redundant labels.
 */
export function formatCaretakerNoteForSummary(note: string): string {
  const content = note.replace(CARETAKER_NOTE_COMMENT_REGEX, '').trim() || note.trim();
  const lines = content.split(/\r?\n/).map((line) => line.trimEnd());
  if (lines.length <= 1) {
    return lines[0] || '';
  }
  return '\n' + lines.map((l) => `         ${l}`).join('\n');
}

/**
 * Returns a summary string for a single pull request including target branches and any
 * caretaker note.
 */
export function getPullRequestSummary(pullRequest: PullRequest): string {
  const lines: string[] = [`PR #${pullRequest.prNumber}:`];
  lines.push(`       branches: ${pullRequest.targetBranches.join(', ')}`);
  if (pullRequest.hasCaretakerNote) {
    if (pullRequest.caretakerNote) {
      lines.push(
        `       caretaker note: ${formatCaretakerNoteForSummary(pullRequest.caretakerNote)}`,
      );
    } else {
      lines.push(
        `       caretaker note: ${red(`Applied, but no note found in comments (${pullRequest.url})`)}`,
      );
    }
  }
  if (pullRequest.validationFailures?.length) {
    for (const failure of pullRequest.validationFailures) {
      lines.push(`       validation warning: ${yellow(failure.message)}`);
    }
  }
  return lines.join('\n');
}

/**
 * Returns a combined summary of multiple pull requests, separated by double newlines.
 */
export function getMultiPullRequestSummary(pullRequests: PullRequest[]): string {
  return pullRequests.map(getPullRequestSummary).join('\n\n');
}

/**
 * Returns a summary of the merge results across all processed pull requests.
 */
export function getMergeResultsSummary(
  results: PullRequestMergeResult[],
  isDryRun = false,
): string {
  const lines: string[] = [bold('Merge Results:')];
  for (const result of results) {
    if (result.status === 'success') {
      const branches = result.targetBranches?.length
        ? ` into ${result.targetBranches.join(', ')}`
        : '';
      const action = isDryRun ? 'Can be merged' : 'Successfully merged';
      lines.push(green(`  ✓  PR #${result.prNumber}: ${action}${branches}`));
    } else {
      const reason = result.failureReason ? `: ${result.failureReason}` : '';
      lines.push(red(`  ✘  PR #${result.prNumber}: Failed to merge${reason}`));
    }
  }
  return lines.join('\n');
}
