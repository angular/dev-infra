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
import {PublishCiTool} from './index-ci.js';
import {green, Log} from '../../utils/logging.js';

/** Command line options for the release publish-ci command. */
export interface ReleasePublishCiOptions {
  /** Path to the directory containing pre-built packages. */
  builtPackagesDir: string;
  /** The expected Git SHA of the release commit. */
  expectedSha: string;
  /** Run the publish command in dry-run mode. */
  dryRun?: boolean;
}

function builder(argv: Argv): Argv<ReleasePublishCiOptions> {
  return addGithubTokenOption(argv)
    .option('built-packages-dir' as 'builtPackagesDir', {
      type: 'string',
      demandOption: true,
      description: 'Path to the directory containing pre-built packages.',
    })
    .option('expected-sha' as 'expectedSha', {
      type: 'string',
      demandOption: true,
      description: 'The expected Git SHA of the release commit.',
    })
    .option('dry-run' as 'dryRun', {
      type: 'boolean',
      default: false,
      description:
        'Run the publish command in dry-run mode, skipping tag/release creation and NPM publishing.',
    });
}

async function handler(flags: Arguments<ReleasePublishCiOptions>) {
  const git = await AuthenticatedGitClient.get();
  const config = await getConfig();
  assertValidReleaseConfig(config);
  assertValidGithubConfig(config);

  const tool = new PublishCiTool(config, git, git.baseDir, flags);

  try {
    await tool.run();
    Log.info(green('Release CI publish completed successfully.'));
  } catch (e) {
    if (e instanceof Error) {
      Log.error(`Release CI publish failed: ${e.message}`);
      if (e.stack) {
        Log.debug(e.stack);
      }
    } else {
      Log.error(`Release CI publish failed with unknown error: ${e}`);
    }
    process.exitCode = 1;
  }
}

/** Yargs command module for the 'publish-ci' command. */
export const ReleasePublishCiCommandModule: CommandModule<{}, ReleasePublishCiOptions> = {
  builder,
  handler,
  command: 'publish-ci',
  describe: 'Publish a release from CI.',
};
