import {Milestone as GithubMilestone} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';

export interface FirestoreMilestone {
  title: string;
  description: string;
  openIssues: number;
  closedIssues: number;
  state: GithubMilestone['state'];
}

export class Milestone extends GithubBaseModel<FirestoreMilestone> {
  readonly title = this.data.title;
  readonly description = this.data.description;
  readonly openIssues = this.data.openIssues;
  readonly closedIssues = this.data.closedIssues;
  readonly state = this.data.state;

  static override githubHelpers: GithubHelperFunctions<
    Milestone,
    GithubMilestone,
    FirestoreMilestone
  > = {
    buildRefString(model: GithubMilestone) {
      return toFirestoreReference(`githubMilestone/${model.node_id}`);
    },
    fromGithub(model: GithubMilestone) {
      return {
        title: model.title,
        description: model.description || '',
        openIssues: model.open_issues,
        closedIssues: model.closed_issues,
        state: model.state,
      };
    },
  };
}
