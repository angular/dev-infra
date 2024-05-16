/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseNpmDistTagSetCommand} from '../npm-dist-tag/set/cli.js';

// ---- **IMPORTANT** ----
// This command is part of our external commands invoked by the release publish
// command. Before making changes, keep in mind that more recent `ng-dev` versions
// can still invoke this command.
// ------------------------

// TODO(devversion): Remove this command in 2024 Jan. It only exists for backwards compat.
//  If all active and LTS release trains support the new `release npm-dist-tag`
//  command, this can be removed.

/** CLI command module for setting an NPM dist tag. */
export const ReleaseSetDistTagCommand: typeof ReleaseNpmDistTagSetCommand = {
  ...ReleaseNpmDistTagSetCommand,
  command: 'set-dist-tag <tag-name> <target-version>',
};
