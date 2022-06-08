/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConfigValidationError} from '../utils/config.js';

interface Formatter {
  matchers: string[];
}

export interface FormatConfig {
  [key: string]: boolean | Formatter;
}

/** Retrieve and validate the config as `FormatConfig`. */
export function assertValidFormatConfig<T>(
  config: T & Partial<{format: FormatConfig}>,
): asserts config is T & {format: FormatConfig} {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  if (config.format === undefined) {
    throw new ConfigValidationError(`No configuration defined for "format"`);
  }

  for (const [key, value] of Object.entries(config.format!)) {
    switch (typeof value) {
      case 'boolean':
        break;
      case 'object':
        checkFormatterConfig(key, value, errors);
        break;
      default:
        errors.push(`"format.${key}" is not a boolean or Formatter object`);
    }
  }
  if (errors.length) {
    throw new ConfigValidationError('Invalid "format" configuration', errors);
  }
}

/** Validate an individual Formatter config. */
function checkFormatterConfig(key: string, config: Partial<Formatter>, errors: string[]) {
  if (config.matchers === undefined) {
    errors.push(`Missing "format.${key}.matchers" value`);
  }
}
