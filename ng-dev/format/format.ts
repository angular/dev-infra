/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, Log} from '../utils/logging';
import {Prompt} from '../utils/prompt';

import {runFormatterInParallel} from './run-commands-parallel';

/**
 * Format provided files in place.
 *
 * @returns a status code indicating whether the formatting run was successful.
 */
export async function formatFiles(files: string[]): Promise<1 | 0> {
  // Whether any files failed to format.
  let failures = await runFormatterInParallel(files, 'format');

  if (failures === false) {
    Log.info('No files matched for formatting.');
    return 0;
  }

  // The process should exit as a failure if any of the files failed to format.
  if (failures.length !== 0) {
    Log.error(`The following files could not be formatted:`);
    failures.forEach(({filePath, message}) => {
      Log.info(`  • ${filePath}: ${message}`);
    });
    Log.error(`Formatting failed, see errors above for more information.`);
    return 1;
  }
  Log.info(green(`√  Formatting complete.`));
  return 0;
}

/**
 * Check provided files for formatting correctness.
 *
 * @returns a status code indicating whether the format check run was successful.
 */
export async function checkFiles(files: string[]) {
  // Files which are currently not formatted correctly.
  const failures = await runFormatterInParallel(files, 'check');

  if (failures === false) {
    Log.info('No files matched for formatting check.');
    return 0;
  }

  if (failures.length) {
    // Provide output expressing which files are failing formatting.
    Log.warn.group('\nThe following files are out of format:');
    for (const {filePath} of failures) {
      Log.warn(`  • ${filePath}`);
    }
    Log.warn.groupEnd();
    Log.warn();

    // If the command is run in a non-CI environment, prompt to format the files immediately.
    let runFormatter = false;
    if (!process.env['CI']) {
      runFormatter = await Prompt.confirm('Format the files now?', true);
    }

    if (runFormatter) {
      // Format the failing files as requested.
      return (await formatFiles(failures.map((f) => f.filePath))) || 0;
    } else {
      // Inform user how to format files in the future.
      Log.info();
      Log.info(`To format the failing file run the following command:`);
      Log.info(`  yarn ng-dev format files ${failures.map((f) => f.filePath).join(' ')}`);
      return 1;
    }
  } else {
    Log.info(green('√  All files correctly formatted.'));
    return 0;
  }
}
