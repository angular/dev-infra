import {PullRequest as GithubPullRequest} from '@octokit/webhooks-types';
import {
  FirestoreReference,
  GithubBaseModel,
  GithubHelperFunctions,
  toFirestoreReference,
} from './base';
import {Label} from './label';
import {Milestone} from './milestone';
import {Team} from './team';
import {User, isUserFromGithub} from './user';

export interface FirestorePullRequest {
  owner: string;
  repo: string;
  node: string;
  state: GithubPullRequest['state'];
  authorAssociation: GithubPullRequest['author_association'];
  changedFiles: number;
  closedAt: string | null;
  commits: number;
  createdAt: string;
  draft: boolean;
  labels: FirestoreReference<Label>[];
  maintainerCanModify: boolean;
  number: number;
  requestedReviewers: (FirestoreReference<User> | FirestoreReference<Team>)[];
  title: string;
  milestone: null | FirestoreReference<Milestone>;
  assignees: FirestoreReference<User>[];
  user: FirestoreReference<User>;
  commit: string;
}

export class PullRequest extends GithubBaseModel<FirestorePullRequest> {
  readonly owner = this.data.owner;
  readonly repo = this.data.repo;
  readonly node = this.data.node;
  readonly state = this.data.state;
  readonly authorAssociation = this.data.authorAssociation;
  readonly changeFiles = this.data.changedFiles;
  readonly closedAt = this.data.closedAt;
  readonly commits = this.data.commits;
  readonly createdAt = this.data.createdAt;
  readonly draft = this.data.draft;
  readonly labels = this.data.labels;
  readonly maintainerCanModify = this.data.maintainerCanModify;
  readonly number = this.data.number;
  readonly requestedReviewers = this.data.requestedReviewers;
  readonly title = this.data.title;
  readonly milestone = this.data.milestone;
  readonly assignees = this.data.assignees;
  readonly user = this.data.user;
  readonly commit = this.data.commit;

  static override githubHelpers: GithubHelperFunctions<
    PullRequest,
    GithubPullRequest,
    FirestorePullRequest
  > = {
    buildRefString(model: GithubPullRequest) {
      return toFirestoreReference(`githubPullRequest/${model.node_id}`);
    },
    fromGithub(model: GithubPullRequest) {
      return {
        assignees: model.assignees.map(User.githubHelpers.buildRefString),
        authorAssociation: model.author_association,
        changedFiles: model.changed_files,
        closedAt: model.closed_at,
        commit: model.head.sha,
        commits: model.commits,
        createdAt: model.created_at,
        draft: model.draft,
        labels: model.labels.map((l) => Label.githubHelpers.buildRefString(l)),
        maintainerCanModify: model.maintainer_can_modify,
        milestone: model.milestone ? Milestone.githubHelpers.buildRefString(model.milestone) : null,
        node: model.node_id,
        number: model.number,
        owner: model.base.repo.owner.login,
        repo: model.base.repo.name,
        requestedReviewers: model.requested_reviewers.map((userOrTeam) => {
          return isUserFromGithub(userOrTeam)
            ? User.githubHelpers.buildRefString(userOrTeam)
            : Team.githubHelpers.buildRefString(userOrTeam);
        }),
        state: model.state,
        title: model.title,
        user: User.githubHelpers.buildRefString(model.user),
      };
    },
  };
}
