import {Team as GithubTeam, User as GithubUser} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';

export interface FirestoreTeam {
  slug: string;
  name: string;
  privacy: GithubTeam['privacy'];
}

export class Team extends GithubBaseModel<FirestoreTeam> {
  readonly slug = this.data.slug;
  readonly name = this.data.name;
  readonly private = this.data.privacy;

  static override githubHelpers: GithubHelperFunctions<Team, GithubTeam, FirestoreTeam> = {
    buildRefString(model: GithubTeam) {
      return toFirestoreReference(`githubTeam/${model.node_id}`);
    },
    fromGithub(model: GithubTeam) {
      return {
        name: model.name,
        privacy: model.privacy,
        slug: model.slug,
      };
    },
  };
}

export function isTeamFromGithub(userOrTeam: GithubUser | GithubTeam): userOrTeam is GithubTeam {
  if ((userOrTeam as any).type !== undefined) {
    return true;
  }
  return false;
}
