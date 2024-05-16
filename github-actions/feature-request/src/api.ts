/**
 * Interface for running queries against GitHub's API.
 *
 * We use an "active record"-like communication mechanism. The GitHubAPI
 * query returns comment objects which allow us to perform actions over
 * individual comments.
 */
export interface GitHubAPI {
  query(query: Query): AsyncIterableIterator<GitHubIssueAPI>;
  isOrgMember(user: string, org: string): Promise<boolean>;
}

/**
 * Type used for the content of the comments coming from the bot.
 *
 * We're not using plain string here, because we want to ensure each
 * comment the bot posts contains a UUID that will allow us to later identify.
 */
export type MarkedComment = string & {
  __PRIVATE_MARKED_COMMENT: void;
};

/**
 * Class which allows us to perform actions over GitHub comments.
 */
export interface GitHubIssueAPI {
  get(): Promise<Issue>;

  postComment(body: MarkedComment): Promise<void>;
  getComments(last?: boolean): AsyncIterableIterator<Comment>;

  close(): Promise<void>;

  addLabel(label: string): Promise<void>;
  removeLabel(label: string): Promise<void>;
}

/**
 * Lists the fields we can sort issues/PRs by.
 */
type SortVar =
  | 'comments'
  | 'reactions'
  | 'reactions-+1'
  | 'reactions--1'
  | 'reactions-smile'
  | 'reactions-thinking_face'
  | 'reactions-heart'
  | 'reactions-tada'
  | 'interactions'
  | 'created'
  | 'updated';

/**
 * Comment sort order.
 */
type SortOrder = 'asc' | 'desc';

/**
 * Represents a particular query we can run against GitHub API.
 */
export interface Query {
  q: string;
  sort?: SortVar;
  order?: SortOrder;
}

/**
 * Type which contains the types of reaction a comment may contain. We're
 * primarily interested in the +1 reaction to determine the community demand
 * for a particular issue.
 */
export type Reactions = {
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
};

/**
 * Represents a GitHub user or a comment author.
 */
export interface User {
  name: string;
  isGitHubApp?: boolean;
}

/**
 * Represents a comment object we get from the GitHub API.
 */
export interface Comment {
  author: User;
  body: string;
  id: number;
  timestamp: number;
}

/**
 * Represents the Issue object we get from the GitHub API.
 */
export interface Issue {
  author: User;
  body: string;
  title: string;
  labels: string[];
  open: boolean;
  locked: boolean;
  number: number;
  numComments: number;
  reactions: Reactions;
  assignee?: string;
  createdAt: number;
  updatedAt: number;
  closedAt?: number;
}
