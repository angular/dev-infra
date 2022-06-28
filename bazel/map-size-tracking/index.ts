/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {runfiles} from '@bazel/runfiles';

import {compareFileSizeData} from './file_size_compare.js';
import {FileSizeData} from './file_size_data.js';
import {SizeTracker} from './size_tracker.js';

// TODO(ESM) This can be replaced with an actual ESM import when `ts_library` is
// guaranteed to be ESM-only and supports the `mts` extension.
const chalk = {red: (v: string) => v, green: (v: string) => v};

export async function main(
  entryPointScriptPath: string,
  sourceMapPath: string,
  goldenSizeMapPath: string,
  writeGolden: boolean,
  maxPercentageDiff: number,
  maxByteDiff: number,
): Promise<void> {
  const tracker = new SizeTracker(entryPointScriptPath, sourceMapPath);
  const sizeResult = await tracker.computeSizeResult();

  if (writeGolden) {
    writeFileSync(goldenSizeMapPath, JSON.stringify(sizeResult, null, 2));
    console.error(chalk.green(`Updated golden size data in ${goldenSizeMapPath}`));
    return;
  }

  const expectedSizeData = JSON.parse(readFileSync(goldenSizeMapPath, 'utf8')) as FileSizeData;
  const differences = compareFileSizeData(sizeResult, expectedSizeData, {
    maxByteDiff,
    maxPercentageDiff,
  });

  if (!differences.length) {
    return;
  }

  console.error(
    `Computed file size data does not match golden size data. ` +
      `The following differences were found:\n`,
  );
  differences.forEach(({filePath, message}) => {
    const failurePrefix = filePath ? `"${filePath}": ` : '';
    console.error(chalk.red(`    ${failurePrefix}${message}`));
  });

  const bazelTargetName = process.env['TEST_TARGET'];

  console.error(`\nThe golden file can be updated with the following command:`);
  console.error(`    yarn bazel run ${bazelTargetName}.accept`);

  throw new Error('Actual size report does not match with golden file.');
}

if (require.main === module) {
  const [
    fileRootPath,
    sourceMapRootPath,
    goldenRootPath,
    maxPercentageDiffArg,
    maxSizeDiffArg,
    writeGoldenArg,
  ] = process.argv.slice(2);

  main(
    runfiles.resolveWorkspaceRelative(fileRootPath),
    runfiles.resolveWorkspaceRelative(sourceMapRootPath),
    runfiles.resolveWorkspaceRelative(goldenRootPath),
    writeGoldenArg === 'true',
    parseInt(maxPercentageDiffArg),
    parseInt(maxSizeDiffArg),
  ).catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
