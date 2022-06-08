/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';

import {CheckTargetBranchesModule} from './check-target-branches/cli.js';
import {CheckoutCommandModule} from './checkout/cli.js';
import {DiscoverNewConflictsCommandModule} from './discover-new-conflicts/cli.js';
import {MergeCommandModule} from './merge/cli.js';
import {RebaseCommandModule} from './rebase/cli.js';

/** Build the parser for pull request commands. */
export function buildPrParser(localYargs: Argv) {
  return localYargs
    .help()
    .strict()
    .demandCommand()
    .command(DiscoverNewConflictsCommandModule)
    .command(RebaseCommandModule)
    .command(MergeCommandModule)
    .command(CheckoutCommandModule)
    .command(CheckTargetBranchesModule);
}
