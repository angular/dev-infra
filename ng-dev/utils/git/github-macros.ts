/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AuthenticatedGithubClient, isGithubApiError} from './github.js';
import {RestEndpointMethodTypes} from '@octokit/rest';

/** Result of checking whether a user is a member of the `googlers` GitHub organization. */
export interface GooglerOrgVerificationResult {
  /** Whether the user was confirmed to be a member of the `googlers` organization. */
  isMember: boolean;
  /**
   * Whether the authenticated token/account has permission to verify private membership in the
   * `googlers` organization (as opposed to being redirected to `/public_members/` or rejected).
   */
  canVerifyOrg: boolean;
}

/**
 * Verifies whether the authenticated client can check private `googlers` organization membership
 * and whether the specified user is a member of the `googlers` organization.
 */
async function verifyGooglerOrgMembership(
  client: AuthenticatedGithubClient,
  username: string,
): Promise<GooglerOrgVerificationResult> {
  try {
    const response = await client.orgs.checkMembershipForUser({org: 'googlers', username});
    if (response.url?.includes('/public_members/')) {
      return {isMember: true, canVerifyOrg: false};
    }
    return {isMember: (response.status as number) === 204, canVerifyOrg: true};
  } catch (e) {
    if (isGithubApiError(e) && e.status === 404 && !e.response?.url?.includes('/public_members/')) {
      return {isMember: false, canVerifyOrg: true};
    }
    return {isMember: false, canVerifyOrg: false};
  }
}

// TODO: sort out implementing caching if we decide to use this somewhere else
async function isGooglerOrgMember(
  client: AuthenticatedGithubClient,
  username: string,
): Promise<boolean> {
  const {isMember} = await verifyGooglerOrgMembership(client, username);
  return isMember;
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
    ...checkResults.check_runs.map((result): CheckResult => ({
      type: 'check',
      name: result.name,
      result: result.status === 'completed' ? result.conclusion! : result.status,
      url: result.details_url ?? '',
      check: result,
    })),
    ...statusResults.statuses.map((result): StatusResult => ({
      type: 'status',
      name: result.context,
      result: result.state,
      description: result.description ?? '',
      url: result.target_url ?? '',
      status: result,
    })),
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
  verifyGooglerOrgMembership,
};
