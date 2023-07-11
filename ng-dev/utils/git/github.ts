/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {OctokitOptions} from '@octokit/core/dist-types/types.js';

import {Octokit} from '@octokit/rest';
import {RequestParameters} from '@octokit/types';
import {RequestError} from '@octokit/request-error';
import {query} from 'typed-graphqlify';
import fetch from 'node-fetch';

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
  // TODO: Consider remove providing fetch to Octokit once everything has moved to node 18.
  /** The octokit instance actually performing API requests. */
  protected _octokit = new Octokit({...this._octokitOptions, request: {fetch}});

  readonly pulls: Octokit['pulls'] = this._octokit.pulls;
  readonly repos: Octokit['repos'] = this._octokit.repos;
  readonly issues: Octokit['issues'] = this._octokit.issues;
  readonly git: Octokit['git'] = this._octokit.git;
  readonly rateLimit: Octokit['rateLimit'] = this._octokit.rateLimit;
  readonly teams: Octokit['teams'] = this._octokit.teams;
  readonly search: Octokit['search'] = this._octokit.search;
  readonly rest: Octokit['rest'] = this._octokit.rest;
  readonly paginate: Octokit['paginate'] = this._octokit.paginate;

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
