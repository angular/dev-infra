/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {findEntryPointsWithinNpmPackage} from './find_entry_points.js';
import * as path from 'path';
import {normalizePathToPosix} from './path-normalize.js';
import {readFileSync} from 'fs';
import {testApiGolden} from './test_api_report.js';
import * as fs from 'fs';
import {Piscina} from 'piscina';

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
  typeNames: string[],
) {
  /** Whether the goldenDir provided is actually pointing to a single file. */
  const singleFileMode = fs.existsSync(goldenDir) && fs.statSync(goldenDir).isFile();
  // TODO(ESM) This can be replaced with an actual ESM import when `ts_library` is
  // guaranteed to be ESM-only and supports the `mts` extension.
  const chalk = {red: (v: string) => v, yellow: (v: string) => v};

  const packageJsonPath = path.join(npmPackageDir, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as PackageJson;
  const entryPoints = findEntryPointsWithinNpmPackage(npmPackageDir, packageJson);
  if (entryPoints.length === 0) {
    console.error(
      'No entry points were found in the provided package for determining the API surface.',
    );
    process.exitCode = 3;
    return;
  }
  const worker = new Piscina<Parameters<typeof testApiGolden>, string>({
    filename: path.resolve(__dirname, './test_api_report.js'),
  });

  const processEntryPoint = async (subpath: string, typesEntryPointPath: string) => {
    // API extractor generates API reports as markdown files. For each types
    // entry-point we maintain a separate golden file. These golden files are
    // based on the name of the defining NodeJS exports subpath in the NPM package,
    // See: https://api-extractor.com/pages/overview/demo_api_report/.
    let goldenName = path.join(subpath, 'index.api.md');
    // In single file mode, the subpath is the golden file.
    if (singleFileMode) {
      goldenName = subpath;
    }
    const goldenFilePath = path.join(goldenDir, goldenName);
    const moduleName = normalizePathToPosix(path.join(packageJson.name, subpath));

    // Run API extractor in child processes. This is because API extractor is very
    // synchronous. This allows us to significantly speed up golden testing.
    const actual = await worker.run([
      typesEntryPointPath,
      stripExportPattern,
      typeNames,
      packageJsonPath,
      moduleName,
    ]);

    if (actual === null) {
      console.error(`Could not generate API golden for subpath: "${subpath}". See errors above.`);
      process.exit(1);
    }

    if (approveGolden) {
      await fs.promises.mkdir(path.dirname(goldenFilePath), {recursive: true});
      await fs.promises.writeFile(goldenFilePath, actual, 'utf8');
    } else {
      const expected = await fs.promises.readFile(goldenFilePath, 'utf8');
      if (actual !== expected) {
        // Keep track of outdated goldens for error message.
        outdatedGoldens.push(goldenName);
        return false;
      }
    }

    return true;
  };

  const outdatedGoldens: string[] = [];
  const tasks: Promise<boolean>[] = [];
  // Process in batches. Otherwise we risk out of memory errors.
  const batchSize = 10;

  for (let i = 0; i < entryPoints.length; i += batchSize) {
    const batchEntryPoints = entryPoints.slice(i, i + batchSize);

    for (const {subpath, typesEntryPointPath} of batchEntryPoints) {
      tasks.push(processEntryPoint(subpath, typesEntryPointPath));
    }

    // Wait for new batch.
    await Promise.all(tasks);
  }

  // Wait for final batch/retrieve all results.
  const results = await Promise.all(tasks);
  const allTestsSucceeding = results.every((r) => r === true);

  if (outdatedGoldens.length) {
    console.error();
    console.error(Array(80).fill('=').join(''));
    console.error(`${Array(35).fill('=').join('')} RESULTS ${Array(36).fill('=').join('')}`);
    console.error(Array(80).fill('=').join(''));
    if (singleFileMode) {
      console.error(
        chalk.red(
          `The golden is out of date and can be updated by running:\n  - yarn bazel run ${process.env.TEST_TARGET}.accept`,
        ),
      );
    } else {
      console.error(chalk.red(`The following goldens are outdated:`));
      outdatedGoldens.forEach((name) => console.info(`-  ${name}`));
      console.info();
      console.info(
        chalk.yellow(
          `The goldens can be updated by running:\n  - yarn bazel run ${process.env.TEST_TARGET}.accept`,
        ),
      );
    }
    console.error(Array(80).fill('=').join(''));
    console.error();
  }

  // Bazel expects `3` as exit code for failing tests.
  process.exitCode = allTestsSucceeding ? 0 : 3;
}

// Invoke main.
(() => {
  const args = process.argv.slice(2);
  let goldenDir = path.resolve(args[0]);
  const npmPackageDir = path.resolve(args[1]);
  const approveGolden = args[2] === 'true';
  const stripExportPattern = new RegExp(args[3]);
  const typeNames = args.slice(4);

  // For approving, point to the real directory outside of the bazel-out.
  if (approveGolden) {
    goldenDir = path.join(process.env.BUILD_WORKSPACE_DIRECTORY!, args[0]);
  }

  main(goldenDir, npmPackageDir, approveGolden, stripExportPattern, typeNames).catch((e) => {
    console.error(e);
    process.exit(1);
  });
})();
