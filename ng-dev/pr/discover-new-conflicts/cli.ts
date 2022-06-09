/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';

import {Log} from '../../utils/logging';
import {addGithubTokenOption} from '../../utils/git/github-yargs';

import {discoverNewConflictsForPr} from './index';

/** The options available to the discover-new-conflicts command via CLI. */
export interface DiscoverNewConflictsOptions {
  date: number;
  pr: number;
}

/** Builds the discover-new-conflicts pull request command. */
function builder(argv: yargs.Argv): yargs.Argv<DiscoverNewConflictsOptions> {
  return addGithubTokenOption(argv)
    .option('date', {
      description: 'Only consider PRs updated since provided date',
      defaultDescription: '30 days ago',
      coerce: (date) => (typeof date === 'number' ? date : Date.parse(date)),
      default: getThirtyDaysAgoDate(),
    })
    .positional('pr', {demandOption: true, type: 'number'});
}

/** Handles the discover-new-conflicts pull request command. */
async function handler({pr, date}: yargs.Arguments<DiscoverNewConflictsOptions>) {
  // If a provided date is not able to be parsed, yargs provides it as NaN.
  if (isNaN(date)) {
    Log.error('Unable to parse the value provided via --date flag');
    process.exit(1);
  }
  await discoverNewConflictsForPr(pr, date);
}

/** Gets a date object 30 days ago from today. */
function getThirtyDaysAgoDate() {
  const date = new Date();
  // Set the hours, minutes and seconds to 0 to only consider date.
  date.setHours(0, 0, 0, 0);
  // Set the date to 30 days in the past.
  date.setDate(date.getDate() - 30);
  return date.getTime();
}

/** yargs command module for discovering new conflicts for a PR  */
export const DiscoverNewConflictsCommandModule: yargs.CommandModule<
  {},
  DiscoverNewConflictsOptions
> = {
  handler,
  builder,
  command: 'discover-new-conflicts <pr>',
  describe: 'Check if a pending PR causes new conflicts for other pending PRs',
};
