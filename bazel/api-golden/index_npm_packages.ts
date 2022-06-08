/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findEntryPointsWithinNpmPackage} from './find_entry_points';
import {join} from 'path';
import {normalizePathToPosix} from './path-normalize';
import {readFileSync} from 'fs';
import {runfiles} from '@bazel/runfiles';
import {testApiGolden} from './test_api_report';

/** Interface describing contents of a `package.json`. */
export interface PackageJson {
  name: string;
  exports?: Record<string, {types?: string}>;
  types?: string;
  typings?: string;
}

/**
 * Entry point for the `api_golden_test_npm_package` Bazel rule. This function determines
 * all types within the specified NPM package and builds API reports that will be compared
 * against golden files within the given golden directory.
 */
async function main(
  goldenDir: string,
  npmPackageDir: string,
  approveGolden: boolean,
  stripExportPattern: RegExp,
  typePackageNames: string[],
) {
  // TODO: This can be replaced with an actual ESM import when `ts_library` is guaranteed
  // to be ESM-only and supports the `mts` extension.
  const {default: chalk} = await import('chalk');

  const packageJsonPath = join(npmPackageDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const entryPoints = findEntryPointsWithinNpmPackage(npmPackageDir, packageJson);
  const outdatedGoldens: string[] = [];

  let allTestsSucceeding = true;

  for (const {subpath, typesEntryPointPath} of entryPoints) {
    // API extractor generates API reports as markdown files. For each types
    // entry-point we maintain a separate golden file. These golden files are
    // based on the name of the defining NodeJS exports subpath in the NPM package,
    // See: https://api-extractor.com/pages/overview/demo_api_report/.
    const goldenName = join(subpath, 'index.md');
    const goldenFilePath = join(goldenDir, goldenName);
    const moduleName = normalizePathToPosix(join(packageJson.name, subpath));

    const {succeeded, apiReportChanged} = await testApiGolden(
      goldenFilePath,
      typesEntryPointPath,
      approveGolden,
      stripExportPattern,
      typePackageNames,
      packageJsonPath,
      moduleName,
    );

    // Keep track of outdated goldens.
    if (!succeeded && apiReportChanged) {
      outdatedGoldens.push(goldenName);
    }

    allTestsSucceeding = allTestsSucceeding && succeeded;
  }

  if (outdatedGoldens.length) {
    console.error(chalk.red(`The following goldens are outdated:`));
    outdatedGoldens.forEach((name) => console.info(`-  ${name}`));
    console.info();
    console.info(
      chalk.yellow(
        `The goldens can be updated by running: yarn bazel run ${process.env.TEST_TARGET}.accept`,
      ),
    );
  }

  // Bazel expects `3` as exit code for failing tests.
  process.exitCode = allTestsSucceeding ? 0 : 3;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const goldenDir = runfiles.resolve(args[0]);
  const npmPackageDir = runfiles.resolve(args[1]);
  const approveGolden = args[2] === 'true';
  const stripExportPattern = new RegExp(args[3]);
  const typePackageNames = args.slice(4);

  main(goldenDir, npmPackageDir, approveGolden, stripExportPattern, typePackageNames).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
