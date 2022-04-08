import {User, Team} from '@octokit/webhooks-types';
import {GithubBaseModel, GithubHelperFunctions} from './base';

export interface FirestoreUser {
  username: string;
  type: User['type'];
  avatarUrl: string;
  name: string;
}

export class GithubUser extends GithubBaseModel<FirestoreUser> {
  readonly avatarUrl = this.data.avatarUrl;
  readonly name = this.data.name;
  readonly type = this.data.type;
  readonly username = this.data.username;

  static override githubHelpers: GithubHelperFunctions<User, FirestoreUser> = {
    buildRefString(model: User) {
      return `githubUser/${model.node_id}`;
    },
    fromGithub(model: User) {
      return {
        avatarUrl: model.avatar_url,
        name: model.name || model.login,
        type: model.type,
        username: model.login,
      };
    },
  };
}

export function isUserFromGithub(userOrTeam: User | Team): userOrTeam is User {
  if ((userOrTeam as any).type === undefined) {
    return true;
  }
  return false;
}
