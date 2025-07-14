/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runCommandInChildProcess} from './process_utils.mjs';
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import {debug} from './debug.mjs';

// Convience access to chalk colors.
const {red, green} = chalk;
/** The size discrepancy we allow in bytes. */
const THRESHOLD_BYTES = 5000;
/** The size discrepancy as a percentage. */
const THRESHOLD_PERCENT = 5;

interface SizeCheckResult {
  expected: number;
  actual: number | undefined;
  failing: boolean;
  details:
    | 'missing'
    | {
        raw: string;
        percent: string;
      };
}

export class SizeTracker {
  constructor(private readonly testPackage: string) {}

  /**
   * Runs the size tracking scripting.
   *
   * Builds the integration test application and then checks if the size of the generated files varies too
   * far from our known file sizes.
   */
  async run(testWorkingDir: string, commandEnv: NodeJS.ProcessEnv): Promise<void> {
    const sizeJsonFilePath = path.join(testWorkingDir, 'size.json');
    // If the integration test provides a size.json file we use it as a size tracking marker.
    if (!existsSync(sizeJsonFilePath)) {
      debug(`Skipping size tracking as no size.json file was found at ${sizeJsonFilePath}`);
      return;
    }
    const success = await runCommandInChildProcess('yarn', ['build'], testWorkingDir, commandEnv);
    if (!success) {
      throw Error('Failed to build for size tracking.');
    }

    const sizes: {[key: string]: SizeCheckResult} = {};

    const expectedSizes = JSON.parse(await fs.readFile(sizeJsonFilePath, 'utf-8')) as {
      [key: string]: number;
    };

    for (let [filename, expectedSize] of Object.entries(expectedSizes)) {
      const generedFilePath = path.join(testWorkingDir, filename);
      if (!existsSync(generedFilePath)) {
        sizes[filename] = {
          actual: undefined,
          failing: true,
          expected: expectedSize,
          details: 'missing',
        };
      } else {
        const {size: actualSize} = await fs.stat(generedFilePath);
        const absoluteSizeDiff = Math.abs(actualSize - expectedSize);
        const percentSizeDiff = (absoluteSizeDiff / expectedSize) * 100;
        const direction = actualSize === expectedSize ? '' : actualSize > expectedSize ? '+' : '-';
        sizes[filename] = {
          actual: actualSize,
          expected: expectedSize,
          failing: absoluteSizeDiff > THRESHOLD_BYTES || percentSizeDiff > THRESHOLD_PERCENT,
          details: {
            raw: `${direction}${absoluteSizeDiff.toFixed(0)}`,
            percent: `${direction}${Math.round(percentSizeDiff * 1000) / 1000}`,
          },
        };
      }
    }

    console.info();
    console.info(Array(80).fill('=').join(''));
    console.info(
      `${Array(28).fill('=').join('')} SIZE TRACKING RESULTS ${Array(29).fill('=').join('')}`,
    );
    console.info(Array(80).fill('=').join(''));
    let failed = false;
    for (let [filename, {actual, expected, failing, details}] of Object.entries(sizes)) {
      failed = failed || failing;
      const bullet = failing ? red('✘') : green('✔');
      console.info(`  ${bullet} ${filename}`);
      if (details === 'missing') {
        console.info(
          `      File not found in generated integration test application, either ensure the file is created or remove it from the size tracking json file.`,
        );
      } else {
        console.info(
          `      Actual Size: ${actual} | Expected Size: ${expected} | ${details.raw} bytes (${details.percent}%)`,
        );
      }
    }
    console.info();
    if (failed) {
      const originalSizeJsonFilePath = path.join(this.testPackage, 'size.json');
      console.info(
        `If this is a desired change, please update the size limits in: ${originalSizeJsonFilePath}`,
      );
      process.exitCode = 1;
    } else {
      console.info(
        `Payload size check passed. All diffs are less than ${THRESHOLD_PERCENT}% or ${THRESHOLD_BYTES} bytes.`,
      );
    }
    console.info(Array(80).fill('=').join(''));
    console.info();
  }
}
