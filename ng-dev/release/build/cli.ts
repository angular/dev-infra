/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// ---- **IMPORTANT** ----
// This command is part of our external commands invoked by the release publish
// command. Before making changes, keep in mind that more recent `ng-dev` versions
// can still invoke this command.
// ------------------------

import {Argv, Arguments, CommandModule} from 'yargs';

import {getConfig} from '../../utils/config.js';
import {green, Log} from '../../utils/logging.js';
import {assertValidReleaseConfig, BuiltPackage} from '../config/index.js';

import {BuildWorker} from './index.js';

/**
 * Type describing the JSON output of this command.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export type ReleaseBuildJsonStdout = BuiltPackage[];

/** Command line options for building a release. */
export interface ReleaseBuildOptions {
  json: boolean;
}

/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv: Argv): Argv<ReleaseBuildOptions> {
  return argv.option('json', {
    type: 'boolean',
    description: 'Whether the built packages should be printed to stdout as JSON.',
    default: false,
  });
}

/** Yargs command handler for building a release. */
async function handler(args: Arguments<ReleaseBuildOptions>) {
  const config = await getConfig();
  assertValidReleaseConfig(config);
  const {npmPackages} = config.release;
  let builtPackages = await BuildWorker.invokeBuild();

  // If package building failed, print an error and exit with an error code.
  if (builtPackages === null) {
    Log.error(`  ✘   Could not build release output. Please check output above.`);
    process.exit(1);
  }

  // If no packages have been built, we assume that this is never correct
  // and exit with an error code.
  if (builtPackages.length === 0) {
    Log.error(`  ✘   No release packages have been built. Please ensure that the`);
    Log.error(`      build script is configured correctly in ".ng-dev".`);
    process.exit(1);
  }

  const missingPackages = npmPackages.filter(
    (pkg) => !builtPackages!.find((b) => b.name === pkg.name),
  );

  // Check for configured release packages which have not been built. We want to
  // error and exit if any configured package has not been built.
  if (missingPackages.length > 0) {
    Log.error(`  ✘   Release output missing for the following packages:`);
    missingPackages.forEach((pkg) => Log.error(`      - ${pkg.name}`));
    process.exit(1);
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(<ReleaseBuildJsonStdout>builtPackages, null, 2));
  } else {
    Log.info(green('  ✓   Built release packages.'));
    builtPackages.forEach(({name}) => Log.info(green(`      - ${name}`)));
  }
}

/** CLI command module for building release output. */
export const ReleaseBuildCommandModule: CommandModule<{}, ReleaseBuildOptions> = {
  builder,
  handler,
  command: 'build',
  // Hidden from help as this is for use by the release tooling itself.
  describe: false,
};
