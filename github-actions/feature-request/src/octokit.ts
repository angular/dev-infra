/**
 * The following file contains a modified version of the Microsoft implementation of
 * communication with GitHub's REST APIs.
 *
 * The original is available at
 * https://github.com/microsoft/vscode-github-triage-actions/blob/eb561150d9bfab77954cfda7ffef149c07e0e079/api/octokit.ts
 */

import { GitHub } from '@actions/github';
import { Octokit } from '@octokit/rest';
import { Comment, GitHubAPI, GitHubIssueAPI, Issue, Query } from './api';
import { log } from './log';

export class OctoKit implements GitHubAPI {
  private _octokit: GitHub;

  // The organization members will likely not change
  // between issues. We want to cache them so we
  // don't query the GitHub API for each issue.
  private _orgMembers = new Set<string>();

  protected get octokit(): GitHub {
    return this._octokit;
  }

  protected mockLabels: Set<string> = new Set();

  constructor(
    protected token: string,
    protected params: { repo: string; owner: string },
    protected options: { readonly: boolean } = { readonly: false },
  ) {
    this._octokit = new GitHub(token);
  }

  async *query(query: Query): AsyncIterableIterator<GitHubIssueAPI> {
    const q = query.q + ` repo:${this.params.owner}/${this.params.repo}`;

    const options = this.octokit.search.issuesAndPullRequests.endpoint.merge({
      ...query,
      q,
      per_page: 100,
      // To access reactions we need a specific media type we specify via the accept header
      // https://docs.github.com/en/rest/reference/repos#list-commit-comments-for-a-repository-preview-notices
      headers: { Accept: 'application/vnd.github.squirrel-girl-preview+json' },
    });

    let pageNum = 0;

    const timeout = async () => {
      if (pageNum < 2) {
        /* pass */
      } else if (pageNum < 4) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    };

    for await (const pageResponse of this.octokit.paginate.iterator(options)) {
      await timeout();
      const page: Array<Octokit.SearchIssuesAndPullRequestsResponseItemsItem> = pageResponse.data;
      log(`Page ${++pageNum}: ${page.map(({ number }) => number).join(' ')}`);
      page.forEach(
        (issue) =>
          yield new OctoKitIssue(
            this.token,
            this.params,
            this.octokitIssueToIssue(issue),
            this.options,
          ),
      );
    }
  }

  async isOrgMember(name: string, org: string): Promise<boolean> {
    if (this._orgMembers.size) {
      return this._orgMembers.has(name);
    }

    const response = this.octokit.paginate.iterator(
      this.octokit.orgs.listMembers.endpoint.merge({
        org,
        per_page: 100,
      }),
    );

    for await (const page of response) {
      for (const user of page.data as Octokit.OrgsListMembersResponse) {
        this._orgMembers.add(user.login);
      }
    }

    return this._orgMembers.has(name);
  }

  protected octokitIssueToIssue(
    issue: Octokit.IssuesGetResponse | Octokit.SearchIssuesAndPullRequestsResponseItemsItem,
  ): Issue {
    return {
      author: { name: issue.user.login, isGitHubApp: issue.user.type === 'Bot' },
      body: issue.body,
      number: issue.number,
      title: issue.title,
      labels: (issue.labels as Octokit.IssuesGetLabelResponse[]).map((label) => label.name),
      open: issue.state === 'open',
      locked: (issue as any).locked,
      numComments: issue.comments,
      reactions: (issue as any).reactions,
      assignee: issue.assignee?.login ?? (issue as any).assignees?.[0]?.login,
      createdAt: +new Date(issue.created_at),
      updatedAt: +new Date(issue.updated_at),
      closedAt: issue.closed_at ? +new Date((issue.closed_at as unknown) as string) : undefined,
    };
  }

  async repoHasLabel(name: string): Promise<boolean> {
    try {
      await this.octokit.issues.getLabel({ ...this.params, name });
      return true;
    } catch (err) {
      if (err.status === 404) {
        return this.options.readonly && this.mockLabels.has(name);
      }
      throw err;
    }
  }
}

export class OctoKitIssue extends OctoKit implements GitHubIssueAPI {
  constructor(
    token: string,
    protected params: { repo: string; owner: string },
    private issueData: { number: number } | Issue,
    options: { readonly: boolean } = { readonly: false },
  ) {
    super(token, params, options);
    log('running bot on issue', issueData.number);
  }

  async close(): Promise<void> {
    log('Closing issue ' + this.issueData.number);
    if (!this.options.readonly)
      await this.octokit.issues.update({
        ...this.params,
        issue_number: this.issueData.number,
        state: 'closed',
      });
  }

  async get(): Promise<Issue> {
    if (isIssue(this.issueData)) {
      log('Got issue data from query result ' + this.issueData.number);
      return this.issueData;
    }

    log('Fetching issue ' + this.issueData.number);
    const issue = (
      await this.octokit.issues.get({
        ...this.params,
        issue_number: this.issueData.number,
        // To access reactions we need a specific media type
        // https://docs.github.com/en/rest/reference/repos#list-commit-comments-for-a-repository-preview-notices
        mediaType: { previews: ['squirrel-girl'] },
      })
    ).data;
    return (this.issueData = this.octokitIssueToIssue(issue));
  }

  async postComment(body: string): Promise<void> {
    log(`Posting comment on ${this.issueData.number}`);
    if (!this.options.readonly)
      await this.octokit.issues.createComment({
        ...this.params,
        issue_number: this.issueData.number,
        body,
      });
  }

  async deleteComment(id: number): Promise<void> {
    log(`Deleting comment ${id} on ${this.issueData.number}`);
    if (!this.options.readonly)
      await this.octokit.issues.deleteComment({
        owner: this.params.owner,
        repo: this.params.repo,
        comment_id: id,
      });
  }

  async *getComments(last?: boolean): AsyncIterableIterator<Comment> {
    log('Fetching comments for ' + this.issueData.number);

    const response = this.octokit.paginate.iterator(
      this.octokit.issues.listComments.endpoint.merge({
        ...this.params,
        issue_number: this.issueData.number,
        per_page: 100,
        ...(last ? { per_page: 1, page: (await this.get()).numComments } : {}),
      }),
    );

    for await (const page of response) {
      (page.data as Octokit.IssuesListCommentsResponseItem[]).forEach(
        (comment) =>
          yield {
            author: { name: comment.user.login, isGitHubApp: comment.user.type === 'Bot' },
            body: comment.body,
            id: comment.id,
            timestamp: +new Date(comment.created_at),
          },
      );
    }
  }

  async addLabel(name: string): Promise<void> {
    log(`Adding label ${name} to ${this.issueData.number}`);
    if (!(await this.repoHasLabel(name))) {
      throw Error(`Action could not execute because label ${name} is not defined.`);
    }
    if (!this.options.readonly)
      await this.octokit.issues.addLabels({
        ...this.params,
        issue_number: this.issueData.number,
        labels: [name],
      });
  }

  async removeLabel(name: string): Promise<void> {
    log(`Removing label ${name} from ${this.issueData.number}`);
    try {
      if (!this.options.readonly)
        await this.octokit.issues.removeLabel({
          ...this.params,
          issue_number: this.issueData.number,
          name,
        });
    } catch (err) {
      if (err.status === 404) {
        log(`Label ${name} not found on issue`);
        return;
      }
      throw err;
    }
  }
}

function isIssue(object: any): object is Issue {
  const isIssue =
    'author' in object &&
    'body' in object &&
    'title' in object &&
    'labels' in object &&
    'open' in object &&
    'locked' in object &&
    'number' in object &&
    'numComments' in object &&
    'reactions' in object &&
    'milestoneId' in object;

  return isIssue;
}
