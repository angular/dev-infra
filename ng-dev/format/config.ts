/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError, NgDevConfig} from '../utils/config.js';

export interface FormatConfig {
  prettier: boolean;
  buildifier: boolean;
}

/** Retrieve and validate the config as `FormatConfig`. */
export function assertValidFormatConfig<T extends NgDevConfig>(
  config: T & Partial<{format: FormatConfig}>,
): asserts config is T & {format: FormatConfig} {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  if (config.format === undefined) {
    throw new ConfigValidationError(`No configuration defined for "format"`);
  }

  for (const [key, value] of Object.entries(config.format!)) {
    if (typeof value !== 'boolean') {
      errors.push(`"format.${key}" is not a boolean`);
    }
  }
  if (errors.length) {
    throw new ConfigValidationError('Invalid "format" configuration', errors);
  }
}
