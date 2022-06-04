/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// ---- **IMPORTANT** ----
// This command is part of our external commands invoked by the release publish
// command. Before making changes, keep in mind that more recent `ng-dev` versions
// can still invoke this command.
// ------------------------

import semver from 'semver';
import yargs from 'yargs';
import {getConfig} from '../../utils/config';

import {Log, bold, green} from '../../utils/logging';
import {Spinner} from '../../utils/spinner';
import {assertValidReleaseConfig} from '../config/index';
import {NpmCommand} from '../versioning/npm-command';
import {createExperimentalSemver, isExperimentalSemver} from '../versioning/experimental-versions';

/** Command line options for setting an NPM dist tag. */
export interface ReleaseSetDistTagOptions {
  tagName: string;
  targetVersion: string;
  skipExperimentalPackages: boolean;
}

function builder(args: yargs.Argv): yargs.Argv<ReleaseSetDistTagOptions> {
  return args
    .positional('tagName', {
      type: 'string',
      demandOption: true,
      description: 'Name of the NPM dist tag.',
    })
    .positional('targetVersion', {
      type: 'string',
      demandOption: true,
      description:
        'Version to which the NPM dist tag should be set.\nThis version will be ' +
        'converted to an experimental version for experimental packages.',
    })
    .option('skipExperimentalPackages', {
      type: 'boolean',
      description: 'Whether the dist tag should not be set for experimental NPM packages.',
      default: false,
    });
}

/** Yargs command handler for setting an NPM dist tag. */
async function handler(args: yargs.Arguments<ReleaseSetDistTagOptions>) {
  const {targetVersion: rawVersion, tagName, skipExperimentalPackages} = args;
  const config = getConfig();
  assertValidReleaseConfig(config);
  const {npmPackages, publishRegistry} = config.release;
  const version = semver.parse(rawVersion);

  if (version === null) {
    Log.error(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`);
    process.exit(1);
  } else if (isExperimentalSemver(version)) {
    Log.error(
      `Unexpected experimental SemVer version specified. This command expects a ` +
        `non-experimental project SemVer version.`,
    );
    process.exit(1);
  }

  Log.debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
  const spinner = new Spinner('');

  for (const pkg of npmPackages) {
    // If `--skip-experimental-packages` is specified, all NPM packages which
    // are marked as experimental will not receive the NPM dist tag update.
    if (pkg.experimental && skipExperimentalPackages) {
      spinner.update(`Skipping "${pkg.name}" due to it being experimental.`);
      continue;
    }

    spinner.update(`Setting NPM dist tag for "${pkg.name}"`);
    const distTagVersion = pkg.experimental ? createExperimentalSemver(version!) : version!;

    try {
      await NpmCommand.setDistTagForPackage(pkg.name, tagName, distTagVersion, publishRegistry);
      Log.debug(`Successfully set "${tagName}" NPM dist tag for "${pkg.name}".`);
    } catch (e) {
      spinner.complete();
      Log.error(e);
      Log.error(`  ✘   An error occurred while setting the NPM dist tag for "${pkg.name}".`);
      process.exit(1);
    }
  }

  spinner.complete();
  Log.info(green(`  ✓   Set NPM dist tag for all release packages.`));
  Log.info(green(`      ${bold(tagName)} will now point to ${bold(`v${version}`)}.`));
}

/** CLI command module for setting an NPM dist tag. */
export const ReleaseSetDistTagCommand: yargs.CommandModule<{}, ReleaseSetDistTagOptions> = {
  builder,
  handler,
  command: 'set-dist-tag <tag-name> <target-version>',
  describe: 'Sets a given NPM dist tag for all release packages.',
};
