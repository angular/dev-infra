import {Label as GithubLabel} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base';

export interface FirestoreLabel {
  name: string;
  color: string;
}

export class Label extends GithubBaseModel<FirestoreLabel> {
  readonly name = this.data.name;
  readonly color = this.data.color;

  static override githubHelpers: GithubHelperFunctions<Label, GithubLabel, FirestoreLabel> = {
    buildRefString(model: GithubLabel) {
      return toFirestoreReference(`githubLabel/${model.node_id}`);
    },
    fromGithub(model: GithubLabel) {
      return {
        name: model.name,
        color: model.color,
      };
    },
  };
}
