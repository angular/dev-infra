/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Argv} from 'yargs';

import {RestoreCommitMessageModule} from './restore-commit-message/cli.js';
import {ValidateFileModule} from './validate-file/cli.js';
import {ValidateRangeModule} from './validate-range/cli.js';

/** Build the parser for the commit-message commands. */
export function buildCommitMessageParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .command(RestoreCommitMessageModule)
    .command(ValidateFileModule)
    .command(ValidateRangeModule);
}
