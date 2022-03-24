import {Label} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions} from './base';

export abstract class FirestoreLabel {
  abstract name: string;
  abstract color: string;
}

export class GithubLabel extends GithubBaseModel<FirestoreLabel> {
  readonly name = this.data.name;
  readonly color = this.data.color;

  static override githubHelpers: GithubHelperFunctions<Label, FirestoreLabel> = {
    buildRefString(model: Label) {
      return `githubLabel/${model.node_id}`;
    },
    fromGithub(model: Label) {
      return {
        name: model.name,
        color: model.color,
      };
    },
  };
}
