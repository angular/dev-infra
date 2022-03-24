import {StatusEvent} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions} from './base';

interface FirestoreStatus {
  context: string;
  targetUrl: string | null;
  state: StatusEvent['state'];
}

export class GithubStatus extends GithubBaseModel<FirestoreStatus> {
  readonly context = this.data.context;
  readonly targetUrl = this.data.targetUrl;
  readonly status = this.data.state;

  static override githubHelpers: GithubHelperFunctions<StatusEvent, FirestoreStatus> = {
    buildRefString(model: StatusEvent) {
      return `githubCommit/${model.sha}/status/${model.context}`;
    },
    fromGithub(model: StatusEvent) {
      return {
        context: model.context,
        state: model.state,
        targetUrl: model.target_url,
      };
    },
  };
}
