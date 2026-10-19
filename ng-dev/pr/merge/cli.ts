/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {addDryRunFlag} from '../../utils/dry-run.js';

import {mergePullRequests, parsePrNumber} from './merge-pull-request.js';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
  prs: number[];
  pr?: number[];
  branchPrompt: boolean;
  forceManualBranches: boolean;
  dryRun: boolean;
  ignorePendingReviews: boolean;
  waitForValidations: boolean;
}

/** Builds the command. */
async function builder(argv: Argv) {
  return addDryRunFlag(addGithubTokenOption(argv))
    .help()
    .strict()
    .positional('prs', {
      alias: 'pr',
      demandOption: true,
      coerce: (prs: (string | number)[]) =>
        (Array.isArray(prs) ? prs : [prs])
          .flatMap((pr) => String(pr).split(','))
          .map((pr) => pr.trim())
          .filter(Boolean)
          .map((pr) => parsePrNumber(pr)),
      type: 'string',
      array: true,
      description: 'The PR(s) to be merged.',
    })
    .option('branch-prompt' as 'branchPrompt', {
      type: 'boolean',
      default: true,
      description: 'Whether to prompt to confirm the branches a PR will merge into.',
    })
    .option('force-manual-branches' as 'forceManualBranches', {
      type: 'boolean',
      default: false,
      description: 'Whether to manually select the branches you wish to merge the PR into.',
    })
    .option('ignore-pending-reviews' as 'ignorePendingReviews', {
      type: 'boolean',
      default: false,
      description: 'Bypass the check for pending reviews on the pull request',
    })
    .option('wait-for-validations' as 'waitForValidations', {
      type: 'boolean',
      default: false,
      description: 'Wait for pending validations to complete before merging.',
    });
}

/** Handles the command. */
async function handler({
  prs,
  pr,
  branchPrompt,
  forceManualBranches,
  dryRun,
  ignorePendingReviews,
  waitForValidations,
}: Arguments<MergeCommandOptions>) {
  await mergePullRequests(prs ?? pr, {
    branchPrompt,
    forceManualBranches,
    dryRun,
    ignorePendingReviews,
    waitForValidations,
  });
}

/** yargs command module describing the command. */
export const MergeCommandModule: CommandModule<{}, MergeCommandOptions> = {
  handler,
  builder,
  command: 'merge <prs..>',
  describe: 'Merge PR(s) into their targeted branches.',
};
