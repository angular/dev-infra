/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestRunner} from './runner';
import {BazelExpandedValue, BazelFileInfo, runfiles} from './bazel';
import * as fs from 'fs';
import {debug} from './debug';

/**
 * Test config that is passed as JSON from the Bazel action.
 * Note: When updating this config, also update the Bazel action.
 */
interface TestConfig {
  testPackage: string;
  testPackageRelativeWorkingDir: string;
  testFiles: BazelFileInfo[];
  npmPackageMappings: Record<string, BazelFileInfo>;
  toolMappings: Record<string, BazelFileInfo>;
  commands: [[binary: BazelExpandedValue, ...args: string[]]];
  environment: Record<string, BazelExpandedValue>;
}

/** Main command line entry-point for the integration test runner. */
async function main(): Promise<void> {
  debug(`Running test with arguments: ${process.argv.join(' ')}`);
  debug(`Current working directory: ${process.cwd()}`);

  const configPath = runfiles.resolveWorkspaceRelative(process.argv[2]);
  const configContent = await fs.promises.readFile(configPath, 'utf8');
  const config = JSON.parse(configContent) as TestConfig;

  // If we run with `DEBUG=1` or `bazel run`, we assume the user wants to debug
  // the test and jump into the integration test directory.
  const isTestDebugMode =
    process.env.DEBUG === '1' || process.env.BUILD_WORKSPACE_DIRECTORY !== undefined;

  debug('Running in test debug mode:', isTestDebugMode);
  debug('Fetched test config:', config);

  const runner = new TestRunner(
    isTestDebugMode,
    config.testFiles,
    config.testPackage,
    config.testPackageRelativeWorkingDir,
    config.toolMappings,
    config.npmPackageMappings,
    config.commands,
    config.environment,
  );

  await runner.run();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
