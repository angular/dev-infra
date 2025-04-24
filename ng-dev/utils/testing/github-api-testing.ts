/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import nock from 'nock';
import {PartialCommit} from '../git/octokit-types.js';

/** Type describing the parameters for a Github release update API request. */
type ReleaseUpdateParameters = RestEndpointMethodTypes['repos']['updateRelease']['parameters'];

/** Type describing the response data for a Github compare commit API request. */
type CompareCommitResponse = RestEndpointMethodTypes['repos']['compareCommits']['response']['data'];

/**
 * Class that represents a Github repository in testing. The class can be
 * used to intercept and except Github API requests for release actions.
 */
export class GithubTestingRepo {
  /** Github API endpoint. */
  private apiEndpoint = `https://api.github.com`;

  /** Github API url for the given repository. */
  private repoApiUrl = `${this.apiEndpoint}/repos/${this.owner}/${this.name}`;

  constructor(
    public owner: string,
    public name: string,
  ) {}

  expectPullRequestToBeCreated(
    baseBranch: string,
    fork: GithubTestingRepo,
    forkBranch: string,
    prNumber: number,
  ): this {
    const expectedHead = `${fork.owner}:${forkBranch}`;
    nock(this.repoApiUrl)
      .post('/pulls', ({base, head}) => base === baseBranch && head === expectedHead)
      .reply(200, {number: prNumber});
    return this;
  }

  expectBranchRequest(branchName: string, commit?: PartialCommit): this {
    nock(this.repoApiUrl)
      .get(`/branches/${branchName}`)
      .reply(commit ? 200 : 404, {commit: commit});
    return this;
  }

  expectFindForkRequest(fork: GithubTestingRepo): this {
    nock(this.apiEndpoint)
      .post(
        '/graphql',
        ({variables}) => variables.owner === this.owner && variables.name === this.name,
      )
      .reply(200, {
        data: {
          repository: {forks: {nodes: [{owner: {login: fork.owner}, name: fork.name}]}},
        },
      });
    return this;
  }

  expectCommitStatusCheck(sha: string, state: 'success' | 'pending' | 'failure'): this {
    nock(this.repoApiUrl)
      .get(`/commits/${sha}/check-runs`)
      .reply(200, {
        check_runs: [{status: state === 'pending' ? state : 'completed', conclusion: state}],
      });
    nock(this.repoApiUrl)
      .get(`/commits/${sha}/status`)
      .reply(200, {statuses: [{state}]});
    return this;
  }

  expectReleaseByTagRequest(tagName: string, id: number): this {
    nock(this.repoApiUrl).get(`/releases/tags/${tagName}`).reply(200, {id});
    return this;
  }

  expectReleaseUpdateRequest(id: number, updatedFields: Partial<ReleaseUpdateParameters>): this {
    nock(this.repoApiUrl)
      .patch(`/releases/${id}`, (body) => JSON.stringify(body) === JSON.stringify(updatedFields))
      .reply(200, {id});
    return this;
  }

  expectPullRequestMergeCheck(prNumber: number, merged: boolean): this {
    nock(this.repoApiUrl).get(`/pulls/${prNumber}`).reply(200, {merged});
    nock(this.repoApiUrl).get(`/issues/${prNumber}/events`).reply(200, []);

    return this;
  }

  expectPullRequestMerge(prNumber: number): this {
    nock(this.repoApiUrl).put(`/pulls/${prNumber}/merge`).reply(200, {merged: true});
    return this;
  }

  expectCommitCompareRequest(
    baseRevision: string,
    headRevision: string,
    result: Partial<CompareCommitResponse>,
  ): this {
    nock(this.repoApiUrl).get(`/compare/${baseRevision}...${headRevision}`).reply(200, result);
    return this;
  }

  expectTagToBeCreated(tagName: string, sha: string): this {
    nock(this.repoApiUrl)
      .post(`/git/refs`, (b) => b.ref === `refs/tags/${tagName}` && b.sha === sha)
      .reply(200, {});
    return this;
  }

  expectReleaseToBeCreated(
    name: string,
    tagName: string,
    isLatestRelease: boolean,
    bodyRegex?: RegExp,
  ): this {
    nock(this.repoApiUrl)
      .post('/releases', (requestBody) => {
        if (requestBody.name !== name) {
          return false;
        }
        if (requestBody.make_latest !== (isLatestRelease ? 'true' : 'false')) {
          return false;
        }
        if (bodyRegex && !bodyRegex.test(requestBody.body)) {
          return false;
        }
        return requestBody['tag_name'] === tagName;
      })
      .reply(200, {});
    return this;
  }
}
