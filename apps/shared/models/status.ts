import {StatusEvent} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';

export interface FirestoreStatus {
  context: string;
  targetUrl: string | null;
  state: StatusEvent['state'];
}

export class Status extends GithubBaseModel<FirestoreStatus> {
  readonly context = this.data.context;
  readonly targetUrl = this.data.targetUrl;
  readonly status = this.data.state;

  static override githubHelpers: GithubHelperFunctions<Status, StatusEvent, FirestoreStatus> = {
    buildRefString(model: StatusEvent) {
      return toFirestoreReference(
        `githubCommit/${model.sha}/status/${model.context.replace(/[:/\s]/g, '_')}`,
      );
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
