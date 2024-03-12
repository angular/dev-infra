/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {OctokitOptions} from '@octokit/core';

import {Octokit, RestEndpointMethodTypes} from '@octokit/rest';
import {RequestParameters} from '@octokit/types';
import {RequestError} from '@octokit/request-error';
import {query} from 'typed-graphqlify';

/**
 * An object representation of a Graphql Query to be used as a response type and
 * to generate a Graphql query string.
 */
export type GraphqlQueryObject = Parameters<typeof query>[1];

/** Interface describing a Github repository. */
export interface GithubRepo {
  /** Owner login of the repository. */
  owner: string;
  /** Name of the repository. */
  name: string;
}

/** A Github client for interacting with the Github APIs. */
export class GithubClient {
  /** The octokit instance actually performing API requests. */
  protected _octokit = new Octokit({...this._octokitOptions});

  readonly pulls: Octokit['pulls'] = this._octokit.pulls;
  readonly orgs: Octokit['orgs'] = this._octokit.orgs;
  readonly repos: Octokit['repos'] = this._octokit.repos;
  readonly issues: Octokit['issues'] = this._octokit.issues;
  readonly git: Octokit['git'] = this._octokit.git;
  readonly rateLimit: Octokit['rateLimit'] = this._octokit.rateLimit;
  readonly teams: Octokit['teams'] = this._octokit.teams;
  readonly search: Octokit['search'] = this._octokit.search;
  readonly rest: Octokit['rest'] = this._octokit.rest;
  readonly paginate: Octokit['paginate'] = this._octokit.paginate;
  readonly checks: Octokit['checks'] = this._octokit.checks;

  constructor(private _octokitOptions?: OctokitOptions) {}
}

/**
 * Extension of the `GithubClient` that provides utilities which are specific
 * to authenticated instances.
 */
export class AuthenticatedGithubClient extends GithubClient {
  /** The graphql instance with authentication set during construction. */
  private _graphql = this._octokit.graphql.defaults({
    headers: {authorization: `token ${this._token}`},
  });

  constructor(private _token: string) {
    // Set the token for the octokit instance.
    super({auth: _token});
  }

  /** Perform a query using Github's Graphql API. */
  async graphql<T extends GraphqlQueryObject>(queryObject: T, params: RequestParameters = {}) {
    return (await this._graphql(query(queryObject).toString(), params)) as T;
  }

  /**
   * Retrieve a combined listing of the results for a refs statuses and checks.
   */
  async getCombinedChecksAndStatusesForRef(
    params: RestEndpointMethodTypes['checks']['listForRef']['parameters'] &
      RestEndpointMethodTypes['repos']['getCombinedStatusForRef']['parameters'],
  ) {
    const {data: checkResults} = await this.checks.listForRef(params);
    const {data: statusResults} = await this.repos.getCombinedStatusForRef(params);

    const results = [
      ...checkResults.check_runs.map((result) => ({
        type: 'check',
        name: result.name,
        result: result.status === 'completed' ? result.conclusion! : result.status,
        url: result.details_url,
        check: result,
      })),
      ...statusResults.statuses.map((result) => ({
        type: 'status',
        name: result.context,
        result: result.state,
        description: result.description,
        url: result.target_url,
        status: result,
      })),
    ];

    return {
      result: results.reduce(
        (currentResult, {result}) => {
          if (
            currentResult === 'pending' ||
            ['queued', 'in_progress', 'pending'].includes(result)
          ) {
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
}

/** Whether the given object corresponds to an Octokit API request error.  */
export function isGithubApiError(obj: unknown): obj is RequestError {
  return (
    obj instanceof Error &&
    // Note: Cannot use `instanceof` here because Octokit may use a different
    // version of `@octokit/request-error` due to version mismatch/hoisting.
    obj.constructor.name === 'RequestError' &&
    (obj as Partial<RequestError>).request !== undefined
  );
}
