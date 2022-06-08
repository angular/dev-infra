/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {ChildProcess} from '../../utils/child-process.js';
import {Spinner} from '../../utils/spinner.js';
import {NpmDistTag} from '../versioning/index.js';

import {FatalReleaseActionError} from './actions-error.js';
import {resolveYarnScriptForProject} from '../../utils/resolve-yarn-bin.js';
import {ReleaseBuildJsonStdout} from '../build/cli.js';
import {ReleaseInfoJsonStdout} from '../info/cli.js';
import {ReleasePrecheckJsonStdin} from '../precheck/cli.js';
import {BuiltPackageWithInfo} from '../config/index.js';
import {green, Log} from '../../utils/logging.js';

/*
 * ###############################################################
 *
 * This file contains helpers for invoking external `ng-dev` commands. A subset of actions,
 * like building release output or setting aν NPM dist tag for release packages, cannot be
 * performed directly as part of the release tool and need to be delegated to external `ng-dev`
 * commands that exist across arbitrary version branches.
 *
 * In a concrete example: Consider a new patch version is released and that a new release
 * package has been added to the `next` branch. The patch branch will not contain the new
 * release package, so we could not build the release output for it. To work around this, we
 * call the ng-dev build command for the patch version branch and expect it to return a list
 * of built packages that need to be released as part of this release train.
 *
 * ###############################################################
 */

/** Class holding method for invoking release action external commands. */
export abstract class ExternalCommands {
  /**
   * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
   * NPM dist tag for all packages in the checked out branch to the given version.
   *
   * Optionally, the NPM dist tag update can be skipped for experimental packages. This
   * is useful when tagging long-term-support packages within NPM.
   */
  static async invokeSetNpmDist(
    projectDir: string,
    npmDistTag: NpmDistTag,
    version: semver.SemVer,
    options: {skipExperimentalPackages: boolean} = {skipExperimentalPackages: false},
  ) {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await resolveYarnScriptForProject(projectDir);

    try {
      // Note: No progress indicator needed as that is the responsibility of the command.
      // TODO: detect yarn berry and handle flag differences properly.
      await ChildProcess.spawn(
        yarnCommand.binary,
        [
          ...yarnCommand.args,
          '--silent',
          'ng-dev',
          'release',
          'set-dist-tag',
          npmDistTag,
          version.format(),
          `--skip-experimental-packages=${options.skipExperimentalPackages}`,
        ],
        {cwd: projectDir},
      );
      Log.info(green(`  ✓   Set "${npmDistTag}" NPM dist tag for all packages to v${version}.`));
    } catch (e) {
      Log.error(e);
      Log.error(`  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".`);
      throw new FatalReleaseActionError();
    }
  }

  /**
   * Invokes the `ng-dev release build` command in order to build the release
   * packages for the currently checked out branch.
   */
  static async invokeReleaseBuild(projectDir: string): Promise<ReleaseBuildJsonStdout> {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await resolveYarnScriptForProject(projectDir);
    // Note: We explicitly mention that this can take a few minutes, so that it's obvious
    // to caretakers that it can take longer than just a few seconds.
    const spinner = new Spinner('Building release output. This can take a few minutes.');

    try {
      // Since we expect JSON to be printed from the `ng-dev release build` command,
      // we spawn the process in silent mode. We have set up an Ora progress spinner.
      // TODO: detect yarn berry and handle flag differences properly.
      const {stdout} = await ChildProcess.spawn(
        yarnCommand.binary,
        [...yarnCommand.args, '--silent', 'ng-dev', 'release', 'build', '--json'],
        {
          cwd: projectDir,
          mode: 'silent',
        },
      );
      spinner.complete();
      Log.info(green('  ✓   Built release output for all packages.'));
      // The `ng-dev release build` command prints a JSON array to stdout
      // that represents the built release packages and their output paths.
      return JSON.parse(stdout.trim()) as ReleaseBuildJsonStdout;
    } catch (e) {
      spinner.complete();
      Log.error(e);
      Log.error('  ✘   An error occurred while building the release packages.');
      throw new FatalReleaseActionError();
    }
  }

  /**
   * Invokes the `ng-dev release info` command in order to retrieve information
   * about the release for the currently checked-out branch.
   *
   * This is useful to e.g. determine whether a built package is currently
   * denoted as experimental or not.
   */
  static async invokeReleaseInfo(projectDir: string): Promise<ReleaseInfoJsonStdout> {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await resolveYarnScriptForProject(projectDir);

    try {
      // Note: No progress indicator needed as that is expected to be a fast operation.
      // TODO: detect yarn berry and handle flag differences properly.
      const {stdout} = await ChildProcess.spawn(
        yarnCommand.binary,
        [...yarnCommand.args, '--silent', 'ng-dev', 'release', 'info', '--json'],
        {
          cwd: projectDir,
          mode: 'silent',
        },
      );
      // The `ng-dev release info` command prints a JSON object to stdout.
      return JSON.parse(stdout.trim()) as ReleaseInfoJsonStdout;
    } catch (e) {
      Log.error(e);
      Log.error(
        `  ✘   An error occurred while retrieving the release information for ` +
          `the currently checked-out branch.`,
      );
      throw new FatalReleaseActionError();
    }
  }

  /**
   * Invokes the `ng-dev release precheck` command in order to validate the
   * built packages or run other validations before actually releasing.
   *
   * This is run as an external command because prechecks can be customized
   * through the `ng-dev` configuration, and we wouldn't want to run prechecks
   * from the `next` branch for older branches, like patch or an LTS branch.
   */
  static async invokeReleasePrecheck(
    projectDir: string,
    newVersion: semver.SemVer,
    builtPackagesWithInfo: BuiltPackageWithInfo[],
  ): Promise<void> {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await resolveYarnScriptForProject(projectDir);
    const precheckStdin: ReleasePrecheckJsonStdin = {
      builtPackagesWithInfo,
      newVersion: newVersion.format(),
    };

    try {
      // Note: No progress indicator needed as that is expected to be a fast operation. Also
      // we expect the command to handle console messaging and wouldn't want to clobber it.
      // TODO: detect yarn berry and handle flag differences properly.
      await ChildProcess.spawn(
        yarnCommand.binary,
        [...yarnCommand.args, '--silent', 'ng-dev', 'release', 'precheck'],
        {
          cwd: projectDir,
          // Note: We pass the precheck information to the command through `stdin`
          // because command line arguments are less reliable and have length limits.
          input: JSON.stringify(precheckStdin),
        },
      );
      Log.info(green(`  ✓   Executed release pre-checks for ${newVersion}`));
    } catch (e) {
      // The `spawn` invocation already prints all stdout/stderr, so we don't need re-print.
      // To ease debugging in case of runtime exceptions, we still print the error to `debug`.
      Log.debug(e);
      Log.error(`  ✘   An error occurred while running release pre-checks.`);
      throw new FatalReleaseActionError();
    }
  }

  /**
   * Invokes the `yarn install` command in order to install dependencies for
   * the configured project with the currently checked out revision.
   */
  static async invokeYarnInstall(projectDir: string): Promise<void> {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await resolveYarnScriptForProject(projectDir);

    try {
      // Note: No progress indicator needed as that is the responsibility of the command.
      // TODO: Consider using an Ora spinner instead to ensure minimal console output.
      await ChildProcess.spawn(
        yarnCommand.binary,
        // TODO: detect yarn berry and handle flag differences properly.
        [...yarnCommand.args, 'install', '--frozen-lockfile', '--non-interactive'],
        {cwd: projectDir},
      );
      Log.info(green('  ✓   Installed project dependencies.'));
    } catch (e) {
      Log.error(e);
      Log.error('  ✘   An error occurred while installing dependencies.');
      throw new FatalReleaseActionError();
    }
  }
}
