/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError} from '../utils/config.js';

export interface CaretakerConfig {
  /** Github queries showing a snapshot of pulls/issues caretakers need to monitor. */
  githubQueries?: {name: string; query: string}[];
  /**
   * The Github group used to track current caretakers. A second group is assumed to exist with the
   * name "<group-name>-roster" containing a list of all users eligible for the caretaker group.
   * */
  caretakerGroup?: string;
}

/** Retrieve and validate the config as `CaretakerConfig`. */
export function assertValidCaretakerConfig<T>(
  config: T & Partial<{caretaker: CaretakerConfig}>,
): asserts config is T & {caretaker: CaretakerConfig} {
  if (config.caretaker === undefined) {
    throw new ConfigValidationError(`No configuration defined for "caretaker"`);
  }
}
