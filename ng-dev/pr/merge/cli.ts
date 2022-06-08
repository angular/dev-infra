/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {addGithubTokenOption} from '../../utils/git/github-yargs.js';

import {mergePullRequest} from './index.js';

/** The options available to the merge command via CLI. */
export interface MergeCommandOptions {
  githubToken: string;
  pr: number;
  branchPrompt: boolean;
  forceManualBranches: boolean;
}

/** Builds the command. */
function builder(argv: Argv) {
  return addGithubTokenOption(argv)
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
    });
}

/** Handles the command. */
async function handler({pr, branchPrompt, forceManualBranches}: Arguments<MergeCommandOptions>) {
  await mergePullRequest(pr, {branchPrompt, forceManualBranches});
}

/** yargs command module describing the command. */
export const MergeCommandModule: CommandModule<{}, MergeCommandOptions> = {
  handler,
  builder,
  command: 'merge <pr>',
  describe: 'Merge a PR into its targeted branches.',
};
