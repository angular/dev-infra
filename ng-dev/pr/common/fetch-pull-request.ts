/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {params, types as graphqlTypes} from 'typed-graphqlify';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {getPr} from '../../utils/github';

/** Graphql schema for the response body the requested pull request. */
const PR_SCHEMA = {
  url: graphqlTypes.string,
  isDraft: graphqlTypes.boolean,
  state: graphqlTypes.oneOf(['OPEN', 'MERGED', 'CLOSED'] as const),
  number: graphqlTypes.number,
  // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
  // requests with more than 100 commits.
  commits: params(
    {last: 100},
    {
      totalCount: graphqlTypes.number,
      nodes: [
        {
          commit: {
            status: {
              state: graphqlTypes.oneOf(['FAILURE', 'PENDING', 'SUCCESS'] as const),
            },
            message: graphqlTypes.string,
          },
        },
      ],
    },
  ),
  maintainerCanModify: graphqlTypes.boolean,
  viewerDidAuthor: graphqlTypes.boolean,
  headRefOid: graphqlTypes.string,
  headRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  baseRef: {
    name: graphqlTypes.string,
    repository: {
      url: graphqlTypes.string,
      nameWithOwner: graphqlTypes.string,
    },
  },
  baseRefName: graphqlTypes.string,
  title: graphqlTypes.string,
  labels: params(
    {first: 100},
    {
      nodes: [
        {
          name: graphqlTypes.string,
        },
      ],
    },
  ),
};

/** A pull request retrieved from github via the graphql API. */
export type RawPullRequest = typeof PR_SCHEMA;

/** Fetches a pull request from Github. Returns null if an error occurred. */
export async function fetchPullRequestFromGithub(
  git: AuthenticatedGitClient,
  prNumber: number,
): Promise<RawPullRequest | null> {
  return await getPr(PR_SCHEMA, prNumber, git);
}
