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

import semver from 'semver';
import {CommandModule} from 'yargs';

import {assertPassingReleasePrechecks} from './index.js';
import {getConfig} from '../../utils/config.js';
import {readBufferFromStdinUntilClosed} from '../../utils/read-stdin-until-closed.js';
import {assertValidReleaseConfig, BuiltPackageWithInfo} from '../config/index.js';
import {Log} from '../../utils/logging.js';

/**
 * Type describing the JSON stdin input of this command. The release tool will
 * deliver this information through `stdin` because command line arguments are
 * less reliable and have max-length limits.
 *
 * @important When changing this, make sure the release action
 *   invocation is updated as well.
 */
export interface ReleasePrecheckJsonStdin {
  /** Package output that has been built and can be checked. */
  builtPackagesWithInfo: BuiltPackageWithInfo[];
  /** New version that is intended to be released. */
  newVersion: string;
}

async function handler() {
  // Note: Stdin input is buffered until we start reading from it. This allows us to
  // asynchronously start reading the `stdin` input. With the default `readableFlowing`
  // value of `null`, data is buffered. See: https://nodejs.org/api/stream.html#three-states.
  const stdin = await readBufferFromStdinUntilClosed();
  const config = await getConfig();
  assertValidReleaseConfig(config);

  // Parse the JSON metadata read from `stdin`.
  const {builtPackagesWithInfo, newVersion: newVersionRaw} = JSON.parse(
    stdin.toString('utf8'),
  ) as ReleasePrecheckJsonStdin;

  if (!Array.isArray(builtPackagesWithInfo)) {
    Log.error(`  ✘   Release pre-checks failed. Invalid list of built packages was provided.`);
    process.exitCode = 1;
    return;
  }

  const newVersion = semver.parse(newVersionRaw);
  if (newVersion === null) {
    Log.error(`  ✘   Release pre-checks failed. Invalid new version was provided.`);
    process.exitCode = 1;
    return;
  }

  if (!(await assertPassingReleasePrechecks(config.release, newVersion, builtPackagesWithInfo))) {
    process.exitCode = 1;
  }
}

/** CLI command module for running checks before releasing. */
export const ReleasePrecheckCommandModule: CommandModule<{}, {}> = {
  handler,
  command: 'precheck',
  // Hidden from help as this is for use by the release tooling itself.
  describe: false,
};
