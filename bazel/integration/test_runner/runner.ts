/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import {addWritePermissionFlag, writeExecutableFile} from './file_system_utils';
import {
  PackageMappings,
  readPackageJsonContents,
  updateMappingsForPackageJson,
} from './package_json';
import {
  BazelExpandedValue,
  BazelFileInfo,
  resolveBazelFile,
  resolveBinaryWithRunfilesGracefully,
} from './bazel';
import {debug} from './debug';
import {
  expandEnvironmentVariableSubstitutions,
  getBinaryPassThroughScript,
  prependToPathVariable,
  runCommandInChildProcess,
} from './process_utils';
import {ENVIRONMENT_TMP_PLACEHOLDER} from './constants';

/**
 * Test runner that takes a set of files within a Bazel package and copies the files
 * to a temporary directory where it then executes a list of specified commands.
 *
 * Additionally, a list of NPM packages can be mapped to Bazel artifacts, allowing for
 * locally-built first-party packages to be tested within such an integration test. The
 * test runner will patch the top-level `package.json` of the test Bazel package for that.
 */
export class TestRunner {
  constructor(
    private readonly testFiles: BazelFileInfo[],
    private readonly testPackage: string,
    private readonly toolMappings: Record<string, BazelFileInfo>,
    private readonly npmPackageMappings: Record<string, BazelFileInfo>,
    private readonly commands: [[binary: BazelExpandedValue, ...args: string[]]],
    private readonly environment: Record<string, BazelExpandedValue>,
  ) {}

  async run() {
    const testDir = await this._getTestTmpDirectoryPath();
    const toolMappings = await this._setupToolMappingsForTest(testDir);
    const testEnv = await this._buildTestProcessEnvironment(testDir, toolMappings.binDir);

    console.info(`Running test in: ${path.normalize(testDir)}`);

    await this._copyTestFilesToDirectory(testDir);
    await this._patchPackageJsonIfNeeded(testDir);
    await this._runTestCommands(testDir, testEnv);
  }

  /**
   * Gets the path to a temporary directory that can be used for running the integration
   * test. The temporary directory will not be deleted as it is controlled by Bazel.
   *
   * In case this test does not run as part of `bazel test`, a system-temporary directory
   * is being created, although not being cleaned up to allow for debugging.
   */
  private async _getTestTmpDirectoryPath(): Promise<string> {
    // Bazel provides a temporary test directory itself when it executes a test. We prefer
    // this when the integration test runs with `bazel test`. In other cases we want to
    // provide a temporary directory that can be used for manually jumping into the
    // directory. The Bazel test tmpdir is not guaranteed to remain so for debugging,
    // when the test is run with `bazel run`, we use a directory we control.
    if (process.env.TEST_TMPDIR) {
      return process.env.TEST_TMPDIR;
    }

    return new Promise((resolve, reject) => {
      tmp.dir(
        {
          template: 'ng-integration-test-XXXXXX',
          keep: true,
        },
        (err, path) => (err ? reject(err) : resolve(path)),
      );
    });
  }

  /**
   * Copies all test files into the temporary directory while
   * preserving the directory structure relative to the test Bazel package.
   */
  private async _copyTestFilesToDirectory(tmpDir: string) {
    const tasks: Promise<void>[] = [];
    for (const file of this.testFiles) {
      tasks.push(this._copyTestFileToDirectory(file, tmpDir));
    }
    // Wait for all asynchronous copy invocations to complete.
    await Promise.all(tasks);
  }

  /**
   * Copies the specified test file into the given temporary directory while
   * preserving the directory structure relative to the test Bazel package.
   *
   * e.g. if the test runs in `integration/a/BUILD.bazel`, then a file named
   * like `integration/a/src/index.ts` will be copied to `<tmp>/src/index.ts`.
   */
  private async _copyTestFileToDirectory(file: BazelFileInfo, tmpDir: string) {
    const outRelativePath = path.relative(this.testPackage, file.shortPath);
    const outAbsolutePath = path.join(tmpDir, outRelativePath);
    const resolvedFilePath = resolveBazelFile(file);

    await fs.promises.mkdir(path.dirname(outAbsolutePath), {recursive: true});
    await fs.promises.copyFile(resolvedFilePath, outAbsolutePath);

    // Bazel removes the write permission from all generated files. Since we copied
    // the test files over to a directory, we want to re-add the write permission in
    // case any tests intend to write to such files.
    await addWritePermissionFlag(outAbsolutePath);
  }

  /**
   * Sets up the tool mappings by creating a temporary bin directory in the test
   * directory. All tools are then symlinked into this bin directory so that the
   * directory can be added to the `$PATH` later when commands are executed.
   */
  private async _setupToolMappingsForTest(testDir: string) {
    const toolBinDir = path.join(testDir, '.integration-bazel-tool-bin');

    // Create the bin directory for the tool mappings.
    await fs.promises.mkdir(toolBinDir, {recursive: true});

    for (const [toolName, toolFile] of Object.entries(this.toolMappings)) {
      const toolAbsolutePath = resolveBazelFile(toolFile);
      const passThroughScripts = getBinaryPassThroughScript(toolAbsolutePath);
      const toolDelegateBasePath = path.join(toolBinDir, toolName);

      await writeExecutableFile(`${toolDelegateBasePath}.cmd`, passThroughScripts.cmd);
      await writeExecutableFile(`${toolDelegateBasePath}.sh`, passThroughScripts.bash);
      await writeExecutableFile(toolDelegateBasePath, passThroughScripts.bash);
    }

    return {binDir: toolBinDir};
  }

  /**
   * Patches the top-level `package.json` in the given test directory by updating
   * all dependency entries with their mapped files. This allows users to override
   * first-party built packages with their locally-built NPM package output.
   */
  private async _patchPackageJsonIfNeeded(testDir: string) {
    const pkgJsonPath = path.join(testDir, 'package.json');
    const pkgJson = await readPackageJsonContents(pkgJsonPath);
    const mappedPackages = Object.keys(this.npmPackageMappings);

    if (pkgJson === null && mappedPackages.length) {
      throw Error(
        `Could not find a "package.json" file in ${this.testPackage}. ` +
          `Make sure the file is part of the Bazel test target as input.`,
      );
    } else if (pkgJson === null) {
      debug('Could not find "package.json" file but there were no mappings. Skipping..');
      return;
    }

    const resolvedMappings = await this._resolvePackageMappings();
    const newPkgJson = updateMappingsForPackageJson(pkgJson, resolvedMappings);

    // Write the new `package.json` file to the test directory, overwriting
    // the `package.json` file initially copied as a test input/file.
    await fs.promises.writeFile(pkgJsonPath, JSON.stringify(newPkgJson, null, 2));
  }

  /**
   * Builds the test process environment object literal. The specified tools bin
   * directory will be added to the environment `PATH` variable.
   *
   * User-specified environment variables can use Bazel location expansion as well
   * as a special placeholder for acquiring a temporary directory for the test.
   */
  private async _buildTestProcessEnvironment(
    testDir: string,
    toolsBinDir: string,
  ): Promise<NodeJS.ProcessEnv> {
    const testEnv: NodeJS.ProcessEnv = {...process.env};
    let i = 0;

    for (let [variableName, value] of Object.entries(this.environment)) {
      let envValue: string = value.value;

      if (value.containsExpansion) {
        envValue = await resolveBinaryWithRunfilesGracefully(envValue);
      } else if (envValue === ENVIRONMENT_TMP_PLACEHOLDER) {
        envValue = path.join(testDir, `.tmp-env-${i++}`);
        await fs.promises.mkdir(envValue);
      }

      testEnv[variableName] = envValue;
    }

    const commandPath = prependToPathVariable(toolsBinDir, testEnv.PATH ?? '');
    return {...testEnv, PATH: commandPath};
  }

  /**
   * Runs the test commands sequentially in the test directory with the given test
   * environment applied to the child process executing the command.
   *
   * @throws An error if any of the configured commands did not complete successfully.
   */
  private async _runTestCommands(testDir: string, commandEnv: NodeJS.ProcessEnv): Promise<void> {
    for (const [binary, ...args] of this.commands) {
      // Only resolve the binary if it contains an expanded value. In other cases we would
      // not want to resolve through runfiles to avoid accidentally unexpected resolution.
      const resolvedBinary = binary.containsExpansion
        ? await resolveBinaryWithRunfilesGracefully(binary.value)
        : binary.value;
      const evaluatedArgs = expandEnvironmentVariableSubstitutions(args, commandEnv);
      const success = await runCommandInChildProcess(
        resolvedBinary,
        evaluatedArgs,
        testDir,
        commandEnv,
      );

      if (!success) {
        throw Error(
          `Integration test command: \`${resolvedBinary} ${evaluatedArgs.join(' ')}\` failed. ` +
            `See error output above for details.`,
        );
      }
    }
  }

  /**
   * Resolves the NPM package mappings to `PackageMappings` where the
   * destination paths are absolute disk paths.
   */
  private async _resolvePackageMappings(): Promise<PackageMappings> {
    const mappings: PackageMappings = {};
    for (const [pkgName, file] of Object.entries(this.npmPackageMappings)) {
      mappings[pkgName] = resolveBazelFile(file);
    }
    return mappings;
  }
}
