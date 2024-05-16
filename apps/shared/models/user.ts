import {User as GithubUser, Team as GithubTeam} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions, toFirestoreReference} from './base.js';

export interface FirestoreUser {
  username: string;
  type: GithubUser['type'];
  avatarUrl: string;
  name: string;
}

export class User extends GithubBaseModel<FirestoreUser> {
  readonly avatarUrl = this.data.avatarUrl;
  readonly name = this.data.name;
  readonly type = this.data.type;
  readonly username = this.data.username;

  static override githubHelpers: GithubHelperFunctions<User, GithubUser, FirestoreUser> = {
    buildRefString(model: GithubUser) {
      return toFirestoreReference(`githubUser/${model.node_id}`);
    },
    fromGithub(model: GithubUser) {
      return {
        avatarUrl: model.avatar_url,
        name: model.name || model.login,
        type: model.type,
        username: model.login,
      };
    },
  };
}

export function isUserFromGithub(userOrTeam: GithubUser | GithubTeam): userOrTeam is GithubUser {
  if ((userOrTeam as any).type === undefined) {
    return true;
  }
  return false;
}
