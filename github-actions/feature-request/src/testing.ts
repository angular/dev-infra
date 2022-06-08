import {GitHubAPI, GitHubIssueAPI, Issue, Comment, Query, User} from './api.js';

export class APIMock implements GitHubAPI {
  constructor(public issues: IssueAPIMock[], public orgMembers: OrgMembers) {}

  query(_: Query) {
    const self = this;
    let current = 0;
    const iterator: AsyncIterableIterator<GitHubIssueAPI> = {
      [Symbol.asyncIterator]() {
        return iterator;
      },
      next() {
        const result = Promise.resolve({
          value: self.issues[current],
          done: current++ >= self.issues.length,
        } as IteratorReturnResult<IssueAPIMock>);
        return result;
      },
    };
    return iterator;
  }

  async isOrgMember(name: string, org: string) {
    if (!this.orgMembers[org]) {
      return Promise.resolve(false);
    }
    if (this.orgMembers[org].indexOf(name) >= 0) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}

type OrgMembers = {[org: string]: string[]};

export class IssueAPIMock implements GitHubIssueAPI, Issue {
  labels: string[] = [];
  author: User = {
    name: 'mgechev',
  };
  body = 'issue body';
  title = 'title';
  locked = false;
  open = true;
  numComments = this.comments.length;
  createdAt = Date.now();
  number = 1;
  reactions = {
    '+1': 0,
    '-1': 0,
    laugh: 0,
    hooray: 0,
    confused: 0,
    heart: 0,
    rocket: 0,
    eyes: 0,
  };
  updatedAt = Date.now();

  constructor(public comments: Comment[]) {}

  get(): Promise<Issue> {
    return Promise.resolve(this);
  }

  postComment(body: string): Promise<void> {
    this.comments.push({
      author: {
        name: 'bot',
      },
      body,
      id: this.comments.length + 1,
      timestamp: Date.now(),
    });
    return Promise.resolve();
  }

  getComments(): AsyncIterableIterator<Comment> {
    const self = this;
    let current = 0;
    const iterator: AsyncIterableIterator<Comment> = {
      [Symbol.asyncIterator]() {
        return iterator;
      },
      next() {
        const result = Promise.resolve({
          value: self.comments[current],
          done: current++ >= self.comments.length,
        } as IteratorReturnResult<Comment>);
        return result;
      },
    };
    return iterator;
  }

  close(): Promise<void> {
    this.open = false;
    return Promise.resolve();
  }

  addLabel(label: string): Promise<void> {
    this.labels.push(label);
    return Promise.resolve();
  }

  removeLabel(label: string): Promise<void> {
    if (!this.labels.includes(label)) {
      return Promise.resolve();
    }
    this.labels.splice(this.labels.indexOf(label), 1);
    return Promise.resolve();
  }
}
