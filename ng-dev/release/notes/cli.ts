/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {writeFileSync} from 'fs';
import {join} from 'path';
import {SemVer} from 'semver';
import {Arguments, Argv, CommandModule} from 'yargs';

import {info} from '../../utils/console';

import {ReleaseNotes} from './release-notes';

/** Command line options for building a release. */
export interface ReleaseNotesOptions {
  from: string;
  to: string;
  outFile?: string;
  releaseVersion: SemVer;
  type: 'github-release' | 'changelog';
}

/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv: Argv): Argv<ReleaseNotesOptions> {
  return argv
    .option('releaseVersion', {
      type: 'string',
      default: '0.0.0',
      coerce: (version: string) => new SemVer(version),
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
    .option('outFile', {
      type: 'string',
      description: 'File location to write the generated release notes to',
      coerce: (filePath?: string) => (filePath ? join(process.cwd(), filePath) : undefined),
    });
}

/** Yargs command handler for generating release notes. */
async function handler({releaseVersion, from, to, outFile, type}: Arguments<ReleaseNotesOptions>) {
  /** The ReleaseNotes instance to generate release notes. */
  const releaseNotes = await ReleaseNotes.forRange(releaseVersion, from, to);

  /** The requested release notes entry. */
  const releaseNotesEntry = await (type === 'changelog'
    ? releaseNotes.getChangelogEntry()
    : releaseNotes.getGithubReleaseEntry());

  if (outFile) {
    writeFileSync(outFile, releaseNotesEntry);
    info(`Generated release notes for "${releaseVersion}" written to ${outFile}`);
  } else {
    process.stdout.write(releaseNotesEntry);
  }
}

/** CLI command module for generating release notes. */
export const ReleaseNotesCommandModule: CommandModule<{}, ReleaseNotesOptions> = {
  builder,
  handler,
  command: 'notes',
  describe: 'Generate release notes',
};
