import {types as graphqlTypes, params, optional, onUnion, query} from 'typed-graphqlify';
import {CheckConclusionState, PullRequestState, StatusState} from '@octokit/graphql-schema';

import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';

/** GraphQL schema for requesting the status information for a given pull request. */
const PR_SCHEMA = {
  repository: params(
    {owner: context.repo.owner, name: context.repo.repo},
    {
      pullRequest: params(
        {number: context.issue.number},
        {
          isDraft: graphqlTypes.boolean,
          state: graphqlTypes.custom<PullRequestState>(),
          number: graphqlTypes.number,
          commits: params(
            {last: 1},
            {
              nodes: [
                {
                  commit: {
                    oid: graphqlTypes.string,
                    statusCheckRollup: optional({
                      contexts: params(
                        {last: 100},
                        {
                          nodes: [
                            onUnion({
                              CheckRun: {
                                __typename: graphqlTypes.constant('CheckRun'),
                                conclusion: graphqlTypes.custom<CheckConclusionState | null>(),
                                name: graphqlTypes.string,
                                title: optional(graphqlTypes.string),
                              },
                              StatusContext: {
                                __typename: graphqlTypes.constant('StatusContext'),
                                state: graphqlTypes.custom<StatusState>(),
                                context: graphqlTypes.string,
                                description: optional(graphqlTypes.string),
                              },
                            }),
                          ],
                        },
                      ),
                    }),
                  },
                },
              ],
            },
          ),
        },
      ),
    },
  ),
};

/** Get the pull request for the status check */
export async function getPullRequest(github: Octokit) {
  return github
    .graphql<typeof PR_SCHEMA>(query(PR_SCHEMA).toString())
    .then((response) => response.repository.pullRequest);
}
