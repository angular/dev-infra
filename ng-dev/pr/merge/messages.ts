/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {red, bold, magenta} from '../../utils/logging.js';

import {PullRequestCommentsFromGithub} from '../common/fetch-pull-request.js';
import {PullRequest} from './pull-request.js';

/** Regular expression matching comments that begin with caretaker note prefixes. */
export const CARETAKER_NOTE_COMMENT_REGEX =
  /^\s*(?:[*_#\[(]+\s*)?(?:caretakers?(?:[\s-]*(?:notes?|\(notes?\)))?|notes?\s+(?:for|to)\s+caretakers?)(?:\s*[\])])?(?:\*{1,2}|_{1,2})?\s*[:"]/i;

/**
 * Searches the comments on a pull request for a single comment matching the caretaker note prefix.
 * Returns the comment body if exactly one matching comment is found, or null otherwise.
 */
export function getCaretakerNoteFromComments(
  comments: PullRequestCommentsFromGithub[],
): string | null {
  const matchingComments = comments.filter(
    (c) => !!c.bodyText && CARETAKER_NOTE_COMMENT_REGEX.test(c.bodyText),
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
