/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Storage} from '@google-cloud/storage';
import yargs from 'yargs';
import {Chromium} from './chromium';
import {findLatestRevisionForAllPlatforms} from './find-revision-chromium';
import {Firefox} from './firefox';
import {uploadBrowserArtifactsToMirror} from './upload-mirror';

async function main() {
  await yargs
    .strict()
    .help()
    .wrap(yargs.terminalWidth())
    .demandCommand()
    .command(
      'find-latest-chromium-revision [start-revision]',
      'Finds the latest stable revision for Chromium with artifacts available for all platforms.',
      (args) => args.positional('startRevision', {type: 'number'}),
      (args) => findLatestRevisionForAllPlatforms(args.startRevision),
    )
    .command('upload-to-mirror', 'Upload browser binaries to the dev-infra cloud mirror', (args) =>
      args
        .demandCommand()
        .command(
          'chromium <revision>',
          'Push Chromium artifacts',
          (cArgs) => cArgs.positional('revision', {type: 'number', demandOption: true}),
          (cArgs) => uploadBrowserArtifactsToMirror(new Storage(), new Chromium(cArgs.revision)),
        )
        .command(
          'firefox <browser-version> <driver-version>',
          'Push Firefox artifacts',
          (fArgs) =>
            fArgs
              .positional('browserVersion', {type: 'string', demandOption: true})
              .positional('driverVersion', {type: 'string', demandOption: true}),
          (fArgs) =>
            uploadBrowserArtifactsToMirror(
              new Storage(),
              new Firefox(fArgs.browserVersion, fArgs.driverVersion),
            ),
        ),
    )
    .parseAsync();
}

main().catch((e) => {
  console.log(e);
  process.exitCode = 1;
});
