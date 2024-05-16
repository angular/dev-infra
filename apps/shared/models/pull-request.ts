import {PullRequest as GithubPullRequest} from '@octokit/webhooks-types';
import {
  FirestoreReference,
  GithubBaseModel,
  GithubHelperFunctions,
  toFirestoreReference,
} from './base.js';
import {Label} from './label.js';
import {Milestone} from './milestone.js';
import {Team} from './team.js';
import {User, isUserFromGithub} from './user.js';

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
  owner!: string;
  repo!: string;
  node!: string;
  state!: string;
  authorAssociation!: string;
  changeFiles!: number;
  closedAt!: string | null;
  commits!: number;
  createdAt!: string;
  draft!: boolean;
  labels!: Label[];
  maintainerCanModify!: boolean;
  number!: number;
  requestedReviewers!: User[];
  title!: string;
  milestone!: Milestone | null;
  assignees!: User[];
  user!: User;
  commit!: string;

  // TODO: Determine the status icon via the data from firebase.
  status = ['pending', 'success', 'failure', 'error'][Math.floor((Math.random() * 100) % 4)];

  override async setData(data: FirestorePullRequest) {
    this.owner = data.owner;
    this.repo = data.repo;
    this.node = data.node;
    this.state = data.state;
    this.authorAssociation = data.authorAssociation;
    this.changeFiles = data.changedFiles;
    this.closedAt = data.closedAt;
    this.commits = data.commits;
    this.createdAt = data.createdAt;
    this.draft = data.draft;
    this.maintainerCanModify = data.maintainerCanModify;
    this.number = data.number;
    this.requestedReviewers = data.requestedReviewers as any;
    this.title = data.title;
    this.milestone = data.milestone as any;
    this.assignees = data.assignees as any;
    this.commit = data.commit;

    // All asyncronous data fields should be awaited together.
    await Promise.all([
      User.getByReference(data.user).then((u) => (this.user = u)),
      Promise.all(data.labels.map((l) => Label.getByReference(l))).then((l) => (this.labels = l)),
    ]);
  }

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
