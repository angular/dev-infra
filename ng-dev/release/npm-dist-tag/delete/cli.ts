/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// ---- **IMPORTANT** ----
// This command is part of our external commands invoked by the release publish
// command. Before making changes, keep in mind that more recent `ng-dev` versions
// can still invoke this command.
// ------------------------

import {Arguments, Argv, CommandModule} from 'yargs';
import {getConfig} from '../../../utils/config.js';

import {bold, green, Log} from '../../../utils/logging.js';
import {Spinner} from '../../../utils/spinner.js';
import {assertValidReleaseConfig} from '../../config/index.js';
import {NpmCommand} from '../../versioning/npm-command.js';

/** Command line options for deleting a NPM dist tag. */
export interface ReleaseNpmDistTagDeleteOptions {
  tagName: string;
}

function builder(args: Argv): Argv<ReleaseNpmDistTagDeleteOptions> {
  return args.positional('tagName', {
    type: 'string',
    demandOption: true,
    description: 'Name of the NPM dist tag.',
  });
}

/** Yargs command handler for deleting an NPM dist tag. */
async function handler(args: Arguments<ReleaseNpmDistTagDeleteOptions>) {
  const {tagName} = args;
  const config = await getConfig();
  assertValidReleaseConfig(config);
  const {npmPackages, publishRegistry} = config.release;

  Log.debug(`Deleting "${tagName}" NPM dist tag for release packages.`);
  const spinner = new Spinner('');

  for (const pkg of npmPackages) {
    spinner.update(`Deleting NPM dist tag for "${pkg.name}"`);

    try {
      await NpmCommand.deleteDistTagForPackage(pkg.name, tagName, publishRegistry);
      Log.debug(`Successfully deleted "${tagName}" NPM dist tag for "${pkg.name}".`);
    } catch (e) {
      spinner.complete();
      Log.error(e);
      Log.error(`  ✘   An error occurred while deleting the NPM dist tag for "${pkg.name}".`);
      process.exit(1);
    }
  }

  spinner.complete();
  Log.info(green(`  ✓   Deleted "${bold(tagName)}" NPM dist tag for all packages.`));
}

/** CLI command module for deleting an NPM dist tag. */
export const ReleaseNpmDistTagDeleteCommand: CommandModule<{}, ReleaseNpmDistTagDeleteOptions> = {
  builder,
  handler,
  command: 'delete <tag-name>',
  describe: 'Deletes a given NPM dist tag for all release packages.',
};
