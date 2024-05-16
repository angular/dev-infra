import {CheckRunEvent} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';

export interface FirestoreCheck {
  name: string;
  detailsUrl: string | null;
  state: CheckRunEvent['check_run']['conclusion'];
}

export class Check extends GithubBaseModel<FirestoreCheck> {
  readonly name = this.data.name;
  readonly targetUrl = this.data.detailsUrl;
  readonly status = this.data.state;

  static override githubHelpers: GithubHelperFunctions<Check, CheckRunEvent, FirestoreCheck> = {
    buildRefString(model: CheckRunEvent) {
      return toFirestoreReference(
        `githubCommit/${model.check_run.head_sha}/check/${model.check_run.name}`,
      );
    },
    fromGithub(model: CheckRunEvent) {
      return {
        name: model.check_run.name,
        detailsUrl: model.check_run.details_url || null,
        state: model.check_run.conclusion,
      };
    },
  };
}
