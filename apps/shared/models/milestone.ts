import {Milestone} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions} from './base';

interface FirestoreMilestone {
  title: string;
  description: string;
  openIssues: number;
  closedIssues: number;
  state: Milestone['state'];
}

export class GithubMilestone extends GithubBaseModel<FirestoreMilestone> {
  readonly title = this.data.title;
  readonly description = this.data.description;
  readonly openIssues = this.data.openIssues;
  readonly closedIssues = this.data.closedIssues;
  readonly state = this.data.state;

  static override githubHelpers: GithubHelperFunctions<Milestone, FirestoreMilestone> = {
    buildRefString(model: Milestone) {
      return `githubMilestone/${model.node_id}`;
    },
    fromGithub(model: Milestone) {
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
