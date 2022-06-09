/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';

import {CheckTargetBranchesModule} from './check-target-branches/cli';
import {CheckoutCommandModule} from './checkout/cli';
import {DiscoverNewConflictsCommandModule} from './discover-new-conflicts/cli';
import {MergeCommandModule} from './merge/cli';
import {RebaseCommandModule} from './rebase/cli';

/** Build the parser for pull request commands. */
export function buildPrParser(localYargs: yargs.Argv) {
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
