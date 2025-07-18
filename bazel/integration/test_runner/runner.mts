/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import {
  BazelExpandedValue,
  BazelFileInfo,
  resolveBazelFile,
  resolveBinaryWithRunfilesGracefully,
} from './bazel.mjs';
import {
  PackageMappings,
  readPackageJsonContents,
  updateMappingsForPackageJson,
} from './package_json.mjs';
import {addWritePermissionFlag, writeExecutableFile} from './file_system_utils.mjs';
import {
  expandEnvironmentVariableSubstitutions,
  getBinaryPassThroughScript,
  prependToPathVariable,
  runCommandInChildProcess,
} from './process_utils.mjs';
import {ENVIRONMENT_TMP_PLACEHOLDER} from './constants.mjs';
import {debug} from './debug.mjs';
import {SizeTracker} from './size-tracking.mjs';

/** Error class that is used when an integration command fails.  */
class IntegrationTestCommandError extends Error {}

/** Type describing an environment configuration that can be passed to the runner. */
type EnvironmentConfig = Record<string, BazelExpandedValue>;

/**
 * Test runner that takes a set of files within a Bazel package and copies the files
 * to a temporary directory where it then executes a list of specified commands.
 *
 * Additionally, a list of NPM packages can be mapped to Bazel artifacts, allowing for
 * locally-built first-party packages to be tested within such an integration test. The
 * test runner will patch the top-level `package.json` of the test Bazel package for that.
 */
export class TestRunner {
  private readonly environment: EnvironmentConfig;
  private readonly sizeTracker: SizeTracker;

  constructor(
    private readonly isTestDebugMode: boolean,
    private readonly testFiles: BazelFileInfo[],
    private readonly testPackage: string,
    private readonly testPackageRelativeWorkingDir: string,
    private readonly toolMappings: Record<string, Pick<BazelFileInfo, 'shortPath'>>,
    private readonly npmPackageMappings: Record<string, BazelFileInfo>,
    private readonly commands: [[binary: BazelExpandedValue, ...args: string[]]],
    environment: EnvironmentConfig,
  ) {
    this.environment = this._assignDefaultEnvironmentVariables(environment);
    this.sizeTracker = new SizeTracker(this.testPackage);
  }

  async run() {
    const testTmpDir = await this._getTestTmpDirectoryPath();
    const testSandboxDir = path.join(testTmpDir, 'test-sandbox');
    const testWorkingDir = path.join(testSandboxDir, this.testPackageRelativeWorkingDir);

    // Create the test sandbox directory. The working directory does not need to
    // be explicitly created here as the test file copying should create the folder.
    await fs.mkdir(testSandboxDir);

    const toolMappings = await this._setupToolMappingsForTest(testTmpDir);
    const testEnv = await this._buildTestProcessEnvironment(testTmpDir, toolMappings.binDir);

    debug(`Temporary directory for integration test: ${path.normalize(testTmpDir)}`);
    debug(`Test files are copied into: ${path.normalize(testWorkingDir)}`);
    console.info(`Running test in directory: ${path.normalize(testWorkingDir)}`);

    await this._copyTestFilesToDirectory(testSandboxDir);
    await this._patchPackageJsonIfNeeded(testWorkingDir);

    try {
      await this._runTestCommands(testWorkingDir, testEnv);
      await this.sizeTracker.run(testWorkingDir, testEnv);
    } finally {
      debug('Finished running integration test commands.');

      // We keep the temporary directory on disk if the users wants to debug the test.
      if (!this.isTestDebugMode) {
        debug('Deleting the integration test temporary directory..');
        await fs.rm(testTmpDir, {force: true, recursive: true, maxRetries: 3});
      }
    }
  }

  /**
   * Gets the path to a temporary directory that can be used for running
   * the integration test.
   *
   * Note that we do not want to use test temporary directory provided by Bazel
   * as it might reside inside the `execroot` and end up making integration tests
   * non-hermetic. e.g. the `.yarnrc.yml` might be inherited incorrectly.
   *
   * This would be especially problematic and inconsistent with integration tests
   * running on some platforms in the sandbox (outside of the execroot).
   */
  private async _getTestTmpDirectoryPath(): Promise<string> {
    // Note: When running inside the Bazel sandbox (darwin or linux), temporary
    // system directories are always writable. See:
    // Linux: https://github.com/bazelbuild/bazel/blob/d35f923b098e4dc9c90b1ab66b413c216bdee638/src/main/java/com/google/devtools/build/lib/sandbox/LinuxSandboxedSpawnRunner.java#L280.
    // Darwin: https://github.com/bazelbuild/bazel/blob/d35f923b098e4dc9c90b1ab66b413c216bdee638/src/main/java/com/google/devtools/build/lib/sandbox/DarwinSandboxedSpawnRunner.java#L170.
    return fs.mkdtemp(path.join(os.tmpdir(), 'ng-integration-test'));
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

    await fs.mkdir(path.dirname(outAbsolutePath), {recursive: true});
    await fs.copyFile(resolvedFilePath, outAbsolutePath);

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
    const toolBinDir = path.join(testDir, 'integration-bazel-tool-bin');

    // Create the bin directory for the tool mappings.
    await fs.mkdir(toolBinDir, {recursive: true});

    for (const [toolName, toolFile] of Object.entries(this.toolMappings)) {
      const toolAbsolutePath = resolveBazelFile(toolFile);
      const passThroughScripts = getBinaryPassThroughScript(toolAbsolutePath);
      const toolDelegateBasePath = path.join(toolBinDir, toolName);

      await writeExecutableFile(`${toolDelegateBasePath}.sh`, passThroughScripts.bash);
      await writeExecutableFile(toolDelegateBasePath, passThroughScripts.bash);
    }

    return {binDir: toolBinDir};
  }

  /**
   * Patches the top-level `package.json` in the given test working directory by
   * updating all dependency entries with their mapped files. This allows users to
   * override first-party built packages with their locally-built NPM package output.
   */
  private async _patchPackageJsonIfNeeded(testWorkingDir: string) {
    const pkgJsonPath = path.join(testWorkingDir, 'package.json');
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
    await fs.writeFile(pkgJsonPath, JSON.stringify(newPkgJson, null, 2));
  }

  /**
   * Builds the test process environment object literal. The specified tools bin
   * directory will be added to the environment `PATH` variable.
   *
   * User-specified environment variables can use Bazel location expansion as well
   * as a special placeholder for acquiring a temporary directory for the test.
   */
  private async _buildTestProcessEnvironment(
    testTmpDir: string,
    toolsBinDir: string,
  ): Promise<NodeJS.ProcessEnv> {
    const testEnv: NodeJS.ProcessEnv = {...process.env};
    let i = 0;

    for (let [variableName, value] of Object.entries(this.environment)) {
      let envValue: string = value.value;

      if (value.containsExpansion) {
        envValue = await resolveBinaryWithRunfilesGracefully(envValue);
      } else if (envValue === ENVIRONMENT_TMP_PLACEHOLDER) {
        envValue = path.join(testTmpDir, `tmp-env-${i++}`);
        await fs.mkdir(envValue);
      }

      testEnv[variableName] = envValue;
    }

    const commandPath = prependToPathVariable(toolsBinDir, testEnv.PATH ?? '');
    return {
      ...testEnv,
      PATH: commandPath,
      // `rules_js` binaries are never build actions, so can be set to `.`.
      // See: https://github.com/aspect-build/rules_js/blob/674f689ff56b962c3cb0509a4b97e99af049a6eb/js/private/js_binary.sh.tpl#L200-L207
      BAZEL_BINDIR: '.',
    };
  }

  /**
   * Runs the test commands sequentially in the test directory with the given test
   * environment applied to the child process executing the command.
   *
   * @throws An error if any of the configured commands did not complete successfully.
   */
  private async _runTestCommands(
    testWorkingDir: string,
    commandEnv: NodeJS.ProcessEnv,
  ): Promise<void> {
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
        testWorkingDir,
        commandEnv,
      );

      if (!success) {
        console.error(`Command failed: \`${resolvedBinary} ${evaluatedArgs.join(' ')}\``);
        console.error(`Command ran in test directory: ${path.normalize(testWorkingDir)}`);
        console.error(`See error output above.`);

        throw new IntegrationTestCommandError();
      }
    }

    console.info(
      `Successfully ran all commands in test directory: ${path.normalize(testWorkingDir)}`,
    );
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

  /**
   * Assigns the default environment environments.
   *
   * We intend to always fake the system home-related directory environment variables
   * to temporary directories. This helps as integration tests (even within the Bazel sandbox)
   * have read access to the system home directory and attempt to write to it.
   */
  private _assignDefaultEnvironmentVariables(baseEnv: EnvironmentConfig): EnvironmentConfig {
    const defaults: EnvironmentConfig = {
      'HOME': {value: ENVIRONMENT_TMP_PLACEHOLDER, containsExpansion: false},
      'PROFILE': {value: ENVIRONMENT_TMP_PLACEHOLDER, containsExpansion: false},
    };

    return {...defaults, ...baseEnv};
  }
}
