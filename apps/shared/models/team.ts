import {Team, User} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions} from './base';

export interface FirestoreTeam {
  readonly slug: string;
  readonly name: string;
  readonly privacy: Team['privacy'];
}

export class GithubTeam extends GithubBaseModel<FirestoreTeam> {
  readonly slug = this.data.slug;
  readonly name = this.data.name;
  readonly private = this.data.privacy;

  static override githubHelpers: GithubHelperFunctions<Team, FirestoreTeam> = {
    buildRefString(model: Team) {
      return `githubTeam/${model.node_id}`;
    },
    fromGithub(model: Team) {
      return {
        name: model.name,
        privacy: model.privacy,
        slug: model.slug,
      };
    },
  };
}

export function isTeamFromGithub(userOrTeam: User | Team): userOrTeam is Team {
  if ((userOrTeam as any).type !== undefined) {
    return true;
  }
  return false;
}
