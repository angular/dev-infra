/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChildProcess} from '../../utils/child-process.js';
import {Spinner} from '../../utils/spinner.js';
import {getBazelBin} from '../../utils/bazel-bin.js';
import {green, Log} from '../../utils/logging.js';

export async function updateGeneratedFileTargets(): Promise<void> {
  const spinner = new Spinner('Querying for all generated file targets');

  // Query for all of the generated file targets
  const result = await ChildProcess.spawn(
    getBazelBin(),
    ['query', `"kind(nodejs_binary, //...) intersect attr(name, '.update$', //...)"`],
    {mode: 'silent'},
  );

  if (result.status !== 0) {
    spinner.complete();
    throw Error(`Unexpected error: ${result.stderr}`);
  }

  const targets = result.stdout.trim().split(/\r?\n/);
  spinner.update(`Found ${targets.length} generated file targets to update`);

  // Build all of the generated file targets in parallel.
  await ChildProcess.spawn(getBazelBin(), ['build', targets.join(' ')], {mode: 'silent'});

  // Individually run the generated file update targets.
  for (let idx = 0; idx < targets.length; idx++) {
    const target = targets[idx];
    spinner.update(`${idx + 1} of ${targets.length} updates completed`);
    const updateResult = await ChildProcess.spawn(getBazelBin(), ['run', target], {mode: 'silent'});
    if (updateResult.status !== 0) {
      spinner.complete();
      throw Error(`Unexpected error while updating: ${target}.`);
    }
  }

  spinner.complete();
  Log.info(` ${green('✔')}  Updated all generated files (${targets.length} targets)`);
}
