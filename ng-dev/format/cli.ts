/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';
import {AllFilesModule} from './all.js';
import {ChangedModule} from './changed.js';
import {FilesModule} from './files.js';
import {StagedModule} from './staged.js';

/** Build the parser for the format commands. */
export function buildFormatParser(localYargs: Argv) {
  return localYargs
    .command(AllFilesModule)
    .command(StagedModule)
    .command(ChangedModule)
    .command(FilesModule);
}
