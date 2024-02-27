/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubClient} from './github.js';

// TODO: sort out implementing caching if we decide to use this somewhere else
export async function isGooglerOrgMember(client: GithubClient, username: string): Promise<boolean> {
  const response = await client.orgs.checkMembershipForUser({org: 'googlers', username});
  if ((response.status as number) === 204) {
    return true;
  }
  return false;
}
