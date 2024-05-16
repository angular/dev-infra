/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGithubClient} from './github.js';
import {RestEndpointMethodTypes} from '@octokit/rest';

// TODO: sort out implementing caching if we decide to use this somewhere else
async function isGooglerOrgMember(
  client: AuthenticatedGithubClient,
  username: string,
): Promise<boolean> {
  try {
    const response = await client.orgs.checkMembershipForUser({org: 'googlers', username});
    if ((response.status as number) === 204) {
      return true;
    }
  } catch {}
  return false;
}

/** Shared base object for a derived Check or Status result. */
interface CheckOrStatusResult {
  type: string;
  name: string;
  result: string;
  url: string;
}

/** A derived Check result */
interface CheckResult extends CheckOrStatusResult {
  type: 'check';
  check: RestEndpointMethodTypes['checks']['listForRef']['response']['data']['check_runs'][number];
}

/** A derived Status result */
interface StatusResult extends CheckOrStatusResult {
  type: 'status';
  description: string;
  status: RestEndpointMethodTypes['repos']['getCombinedStatusForRef']['response']['data']['statuses'][number];
}

/** The overall results of a combined Checks and Statuses check. */
export interface CombinedChecksAndStatusesResult {
  result: 'pending' | 'passing' | 'failing' | null;
  results: (CheckResult | StatusResult)[];
}

/**
 * Retrieve a combined listing of the results for a refs statuses and checks.
 */
async function getCombinedChecksAndStatusesForRef(
  github: AuthenticatedGithubClient,
  params: RestEndpointMethodTypes['checks']['listForRef']['parameters'] &
    RestEndpointMethodTypes['repos']['getCombinedStatusForRef']['parameters'],
): Promise<CombinedChecksAndStatusesResult> {
  const {data: checkResults} = await github.checks.listForRef(params);
  const {data: statusResults} = await github.repos.getCombinedStatusForRef(params);

  const results = [
    ...checkResults.check_runs.map(
      (result): CheckResult => ({
        type: 'check',
        name: result.name,
        result: result.status === 'completed' ? result.conclusion! : result.status,
        url: result.details_url ?? '',
        check: result,
      }),
    ),
    ...statusResults.statuses.map(
      (result): StatusResult => ({
        type: 'status',
        name: result.context,
        result: result.state,
        description: result.description ?? '',
        url: result.target_url ?? '',
        status: result,
      }),
    ),
  ];

  // TODO: Refactor away from a reducer.
  return {
    result: results.reduce(
      (currentResult, {result}) => {
        if (currentResult === 'pending' || ['queued', 'in_progress', 'pending'].includes(result)) {
          return 'pending';
        }

        if (
          currentResult === 'failing' ||
          ['failure', 'error', 'timed_out', 'cancelled'].includes(result)
        ) {
          return 'failing';
        }

        return 'passing';
      },
      null as 'pending' | 'failing' | 'passing' | null,
    ),
    results,
  };
}

export default {
  getCombinedChecksAndStatusesForRef,
  isGooglerOrgMember,
};
