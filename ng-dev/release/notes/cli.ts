/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import {Argv, Arguments, CommandModule} from 'yargs';

import {Log} from '../../utils/logging.js';

import {ReleaseNotes} from './release-notes.js';
import {GitClient} from '../../utils/git/git-client.js';

/** Command line options for building a release. */
export interface Options {
  from: string;
  to: string;
  prependToChangelog: boolean;
  releaseVersion: semver.SemVer;
  type: 'github-release' | 'changelog';
}

/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv: Argv): Argv<Options> {
  return argv
    .option('releaseVersion', {
      type: 'string',
      default: '0.0.0',
      coerce: (version: string) => new semver.SemVer(version),
    })
    .option('from', {
      type: 'string',
      description: 'The git tag or ref to start the changelog entry from',
      demandOption: true,
    })
    .option('to', {
      type: 'string',
      description: 'The git tag or ref to end the changelog entry with',
      default: 'HEAD',
    })
    .option('type', {
      type: 'string',
      description: 'The type of release notes to create',
      choices: ['github-release', 'changelog'] as const,
      default: 'changelog' as const,
    })
    .option('prependToChangelog', {
      type: 'boolean',
      default: false,
      description: 'Whether to update the changelog with the newly created entry',
    });
}

/** Yargs command handler for generating release notes. */
async function handler({releaseVersion, from, to, prependToChangelog, type}: Arguments<Options>) {
  /** Git client to use for generating the release notes. */
  const git = await GitClient.get();
  /** The ReleaseNotes instance to generate release notes. */
  const releaseNotes = await ReleaseNotes.forRange(git, releaseVersion, from, to);

  if (prependToChangelog) {
    await releaseNotes.prependEntryToChangelogFile();
    Log.info(`Added release notes for "${releaseVersion}" to the changelog`);
    return;
  }

  /** The requested release notes entry. */
  const releaseNotesEntry =
    type === 'changelog'
      ? await releaseNotes.getChangelogEntry()
      : await releaseNotes.getGithubReleaseEntry();

  process.stdout.write(releaseNotesEntry);
}

/** CLI command module for generating release notes. */
export const ReleaseNotesCommandModule: CommandModule<{}, Options> = {
  builder,
  handler,
  command: 'notes',
  // Hidden from help as this is for use by the release tooling itself.
  describe: false,
};
