/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Error class that indicates a fatal merge tool error that cannot be ignored. */
export class FatalMergeToolError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** Error class that can be thrown when the user aborted the merge manually. */
export class UserAbortedMergeToolError extends Error {}

export class MismatchedTargetBranchFatalError extends FatalMergeToolError {
  constructor(allowedBranches: string[]) {
    super(
      `Pull request is set to wrong base branch. Please update the PR in the Github UI ` +
        `to one of the following branches: ${allowedBranches.join(', ')}.`,
    );
  }
}

export class UnsatisfiedBaseShaFatalError extends FatalMergeToolError {
  constructor() {
    super(
      `Pull request has not been rebased recently and could be bypassing CI checks. ` +
        `Please rebase the PR.`,
    );
  }
}

export class MergeConflictsFatalError extends FatalMergeToolError {
  constructor(failedBranches: string[]) {
    super(
      `Could not merge pull request into the following branches due to merge ` +
        `conflicts: ${failedBranches.join(', ')}. Please rebase the PR or update the target label.`,
    );
  }
}
