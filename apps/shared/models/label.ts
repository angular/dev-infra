import {Label as GithubLabel} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';
import contrast from 'font-color-contrast';

export interface FirestoreLabel {
  name: string;
  color: string;
}

export class Label extends GithubBaseModel<FirestoreLabel> {
  name!: string;
  color!: string;
  fontColor!: string;

  override setData(data: FirestoreLabel) {
    this.name = data.name;
    this.color = data.color;
    this.fontColor = contrast.default(data.color, 0.6);
  }

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
