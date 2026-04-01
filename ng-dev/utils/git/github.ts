/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {OctokitOptions} from '@octokit/core';

import {Octokit} from '@octokit/rest';
import {RequestParameters} from '@octokit/types';
import {RequestError} from '@octokit/request-error';
import {GraphqlResponseError} from '@octokit/graphql';
import {query} from 'typed-graphqlify';
import {Log} from '../logging';

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

/** Helper to invoke an async function with retries. */
async function invokeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (e) {
      attempt++;
      if (attempt >= retries) {
        throw e;
      }

      // Do not retry valid 4xx Client Errors (especially 404 Not Found)
      if (isGithubApiError(e) && e.status < 500) {
        throw e;
      }

      // Do not retry permanent GraphQL errors
      if (e instanceof GraphqlResponseError) {
        if (!e.errors) {
          throw e; // Missing errors, assume permanent or unknown
        }
        if (
          e.errors.every((err) =>
            ['NOT_FOUND', 'FORBIDDEN', 'BAD_USER_INPUT', 'UNAUTHENTICATED'].includes(err.type!),
          )
        ) {
          throw e;
        }
      }

      Log.warn(`GitHub API call failed (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

/** Creates a proxy that intercepts function calls and applies retries. */
function createRetryProxy<T extends object>(target: T): T {
  return new Proxy(target, {
    get(targetObj, prop, receiver) {
      const value = Reflect.get(targetObj, prop, receiver);
      if (typeof value === 'function') {
        return new Proxy(value, {
          apply(targetFn, thisArg, argArray) {
            return invokeWithRetry(() => (targetFn as Function).apply(targetObj, argArray));
          },
        });
      }
      if (typeof value === 'object' && value !== null) {
        return createRetryProxy(value);
      }
      return value;
    },
    apply(targetFn, thisArg, argArray) {
      return invokeWithRetry(() => (targetFn as Function).apply(thisArg, argArray));
    },
  });
}

/** A Github client for interacting with the Github APIs. */
export class GithubClient {
  /** The octokit instance actually performing API requests. */
  protected _octokit: Octokit = new Octokit({
    // Move all default octokit logging into debug. We prefer handle all of the logging exposed
    // to user's from Github ourselves.
    log: {
      debug: Log.debug,
      error: Log.debug,
      info: Log.debug,
      warn: Log.debug,
    },
    ...this._octokitOptions,
  });

  readonly pulls: Octokit['pulls'] = createRetryProxy(this._octokit.pulls);
  readonly orgs: Octokit['orgs'] = createRetryProxy(this._octokit.orgs);
  readonly repos: Octokit['repos'] = createRetryProxy(this._octokit.repos);
  readonly issues: Octokit['issues'] = createRetryProxy(this._octokit.issues);
  readonly git: Octokit['git'] = createRetryProxy(this._octokit.git);
  readonly rateLimit: Octokit['rateLimit'] = createRetryProxy(this._octokit.rateLimit);
  readonly teams: Octokit['teams'] = createRetryProxy(this._octokit.teams);
  readonly search: Octokit['search'] = createRetryProxy(this._octokit.search);
  readonly rest: Octokit['rest'] = createRetryProxy(this._octokit.rest);
  readonly paginate: Octokit['paginate'] = createRetryProxy(this._octokit.paginate);
  readonly checks: Octokit['checks'] = createRetryProxy(this._octokit.checks);
  readonly users: Octokit['users'] = createRetryProxy(this._octokit.users);

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
    return invokeWithRetry(async () => {
      return (await this._graphql(query(queryObject).toString(), params)) as T;
    });
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
