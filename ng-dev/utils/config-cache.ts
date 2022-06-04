/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// NOTE: This file is decoupled from `config.ts` and is mainly responsible for storing
// the previously read configuration. It is a separate file to allow for it being a
// separate Bazel target with reduced dependencies. This file is used in the overall
// jasmine bootstrap logic and we wouldn't want to bring all of `ng-dev/utils`.

/** The configuration for ng-dev. */
let cachedConfig: {} | null = null;

/**
 * Set the cached configuration object to be loaded later. Only to be used on
 * CI and test situations in which loading from the `.ng-dev/` directory is not possible.
 */
export function setCachedConfig(config: {}): void {
  cachedConfig = config;
}

/** Gets the cached configuration, or `null` if not set. */
export function getCachedConfig(): {} | null {
  return cachedConfig;
}
