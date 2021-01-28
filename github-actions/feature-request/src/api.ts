export interface GitHubAPI {
  query(query: Query): AsyncIterableIterator<GitHubIssueAPI>
  isOrgMember(user: string, org: string): Promise<boolean>;
}

export type MarkedComment = string & {
  __PRIVATE_MARKED_COMMENT: void;
};

export interface GitHubIssueAPI {
  get(): Promise<Issue>

  postComment(body: MarkedComment): Promise<void>
  getComments(last?: boolean): AsyncIterableIterator<Comment>

  close(): Promise<void>

  addLabel(label: string): Promise<void>
  removeLabel(label: string): Promise<void>
}

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

type SortOrder = 'asc' | 'desc';

export type Reactions = {
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface User {
  name: string;
  isGitHubApp?: boolean;
}

export interface Comment {
  author: User;
  body: string;
  id: number;
  timestamp: number;
}

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
export interface Query {
  q: string;
  sort?: SortVar;
  order?: SortOrder;
}
