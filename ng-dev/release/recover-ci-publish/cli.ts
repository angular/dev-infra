/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, Arguments, CommandModule} from 'yargs';

import {assertValidGithubConfig, getConfig} from '../../utils/config.js';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {assertValidReleaseConfig} from '../config/index.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {ReleaseRecoverCiPublishTool} from './recover-ci-publish.js';

/** Command line options for recovering a CI publish run. */
export interface ReleaseRecoverCiPublishOptions {
  runId: number;
  dryRun: boolean;
  publishRegistry: string | undefined;
}

/** Yargs command builder for configuring the `ng-dev release recover-ci-publish` command. */
function builder(argv: Argv): Argv<ReleaseRecoverCiPublishOptions> {
  return addGithubTokenOption(argv)
    .positional('run-id', {
      type: 'number',
      demandOption: true,
      description: 'The GitHub Actions workflow run ID containing the release packages to recover.',
    })
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'Run the recovery process in dry-run mode (skips actual publishing).',
    })
    .option('publish-registry', {
      type: 'string',
      description: 'NPM registry URL to publish packages to (overrides config).',
    }) as unknown as Argv<ReleaseRecoverCiPublishOptions>;
}

/** Yargs command handler for recovering a CI publish run. */
async function handler(args: Arguments<ReleaseRecoverCiPublishOptions>) {
  const git = await AuthenticatedGitClient.get();
  const config = await getConfig();
  assertValidReleaseConfig(config);
  assertValidGithubConfig(config);

  const tool = new ReleaseRecoverCiPublishTool(git, config.release, config.github, args.runId, {
    dryRun: args.dryRun,
    publishRegistry: args.publishRegistry,
  });

  await tool.run();
}

/** CLI command module for recovering a failed GHA publish run locally. */
export const ReleaseRecoverCiPublishCommandModule: CommandModule<
  {},
  ReleaseRecoverCiPublishOptions
> = {
  builder,
  handler,
  command: 'recover-ci-publish <run-id>',
  describe:
    'Recover a failed CI release publish run by downloading built artifacts and publishing them locally.',
};
