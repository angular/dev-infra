/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bazel} from '../../utils/bazel';
import {error, info, red} from '../../utils/console';

/** Discover all bazel targets in the WORKSPACE which generate files. */
function findAllFileGeneratingTargets(): string[] {
  /** Fragments of bazel queries to check for intersections of. */
  const queryFragments = [
    'kind(nodejs_binary, //...)',
    `attr(name, '.update$', //...)`,
    `attr(tags, 'generated-file', //...)`,
  ];
  const result = bazel('query', [`"${queryFragments.join(' intersect ')}"`, '--output', 'label']);
  return result.split('\n').filter((_) => _);
}

/** Run update for all bazel targets in the WORKSPACE which generate files. */
export function updateAllGeneratedFileTargets() {
  /** All the file generating targets in the WORKSPACE */
  const targets = findAllFileGeneratingTargets();

  info(`Discovered ${targets.length} target(s) to run.`);
  /** Discovered failures during update attempts. */
  let failures: Error[] = [];

  for (const target of targets) {
    try {
      bazel('run', [target]);
      info(`${target} succeeded`);
    } catch (e) {
      if (e instanceof Error) {
        failures.push(e);
        error(red(`${target} failed, see below for more detail:`));
        error(e);
      }
      throw e;
    }
  }
  return {
    succeeded: failures.length === 0,
    failures,
  };
}
