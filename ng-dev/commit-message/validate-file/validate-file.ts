/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync} from 'fs';
import {resolve} from 'path';

import {green, Log, yellow} from '../../utils/logging.js';
import {GitClient} from '../../utils/git/git-client.js';

import {
  deleteCommitMessageDraft,
  saveCommitMessageDraft,
} from '../restore-commit-message/commit-message-draft.js';
import {printValidationErrors, validateCommitMessage} from '../validate.js';

/** Validate commit message at the provided file path. */
export function validateFile(filePath: string, isErrorMode: boolean) {
  const git = GitClient.get();
  const commitMessage = readFileSync(resolve(git.baseDir, filePath), 'utf8');
  const {valid, errors} = validateCommitMessage(commitMessage);
  if (valid) {
    Log.info(`${green('√')}  Valid commit message`);
    deleteCommitMessageDraft(filePath);
    process.exitCode = 0;
    return;
  }

  /** Function used to print to the console log. */
  let printFn = isErrorMode ? Log.error : Log.log;

  printFn(isErrorMode ? '✘ Invalid commit message.' : yellow('! Invalid commit message.'));
  printValidationErrors(errors, printFn);
  if (isErrorMode) {
    printFn('Aborting commit attempt due to invalid commit message.');
    printFn('Commit message aborted as failure rather than warning due to local configuration.');
  } else {
    printFn(yellow('Before this commit can be merged into the upstream repository, it must be'));
    printFn(yellow('amended to follow commit message guidelines.'));
  }

  // On all invalid commit messages, the commit message should be saved as a draft to be
  // restored on the next commit attempt.
  saveCommitMessageDraft(filePath, commitMessage);
  // Set the correct exit code based on if invalid commit message is an error.
  process.exitCode = isErrorMode ? 1 : 0;
}
