/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';
import {addDryRunFlag} from '../../utils/dry-run.js';

import {mergePullRequest} from './merge-pull-request.js';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
  pr: number;
  branchPrompt: boolean;
  forceManualBranches: boolean;
  dryRun: boolean;
  ignorePendingReviews: boolean;
}

/** Builds the command. */
async function builder(argv: Argv) {
  return addDryRunFlag(addGithubTokenOption(argv))
    .help()
    .strict()
    .positional('pr', {
      demandOption: true,
      type: 'number',
      description: 'The PR to be merged.',
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
    });
}

/** Handles the command. */
async function handler({
  pr,
  branchPrompt,
  forceManualBranches,
  dryRun,
  ignorePendingReviews,
}: Arguments<MergeCommandOptions>) {
  await mergePullRequest(pr, {branchPrompt, forceManualBranches, dryRun, ignorePendingReviews});
}

/** yargs command module describing the command. */
export const MergeCommandModule: CommandModule<{}, MergeCommandOptions> = {
  handler,
  builder,
  command: 'merge <pr>',
  describe: 'Merge a PR into its targeted branches.',
};
