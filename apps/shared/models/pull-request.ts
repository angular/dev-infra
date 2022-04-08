import {PullRequest} from '@octokit/webhooks-types';
import {FirestoreReference, GithubBaseModel, GithubHelperFunctions} from './base';
import {GithubLabel} from './label';
import {GithubMilestone} from './milestone';
import {GithubTeam} from './team';
import {GithubUser, isUserFromGithub} from './user';

export interface FirestorePullRequest {
  owner: FirestoreReference<GithubUser>;
  repo: string;
  node: string;
  state: PullRequest['state'];
  authorAssociation: PullRequest['author_association'];
  changedFiles: number;
  closedAt: string | null;
  commits: number;
  createdAt: string;
  draft: boolean;
  labels: FirestoreReference<GithubLabel>[];
  maintainerCanModify: boolean;
  number: number;
  requestedReviewers: string[];
  title: string;
  milestone: null | FirestoreReference<GithubMilestone>;
  assignees: FirestoreReference<GithubUser>[];
  user: FirestoreReference<GithubUser>;
  commit: string;
}

export class GithubPullRequest extends GithubBaseModel<FirestorePullRequest> {
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

  static override githubHelpers: GithubHelperFunctions<PullRequest, FirestorePullRequest> = {
    buildRefString(model: PullRequest) {
      return `githubPullRequest/${model.node_id}`;
    },
    fromGithub(model: PullRequest) {
      return {
        assignees: model.assignees.map(GithubUser.githubHelpers.buildRefString),
        authorAssociation: model.author_association,
        changedFiles: model.changed_files,
        closedAt: model.closed_at,
        commit: model.head.sha,
        commits: model.commits,
        createdAt: model.created_at,
        draft: model.draft,
        labels: model.labels.map(GithubLabel.githubHelpers.buildRefString),
        maintainerCanModify: model.maintainer_can_modify,
        milestone: model.milestone
          ? GithubMilestone.githubHelpers.buildRefString(model.milestone)
          : null,
        node: model.node_id,
        number: model.number,
        owner: model.base.repo.owner.login,
        repo: model.base.repo.name,
        requestedReviewers: model.requested_reviewers.map((userOrTeam) => {
          return isUserFromGithub(userOrTeam)
            ? GithubUser.githubHelpers.buildRefString(userOrTeam)
            : GithubTeam.githubHelpers.buildRefString(userOrTeam);
        }),
        state: model.state,
        title: model.title,
        user: GithubUser.githubHelpers.buildRefString(model.user),
      };
    },
  };
}
