/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {red, bold} from '../../utils/logging.js';

import {PullRequest} from './pull-request.js';

export function getCaretakerNotePromptMessage(pullRequest: PullRequest): string {
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
