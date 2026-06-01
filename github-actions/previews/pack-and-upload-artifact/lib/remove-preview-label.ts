/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '@actions/core';
import {Octokit} from '@octokit/rest';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../../utils.js';

async function main() {
  const [pullNumberRaw, labelName] = process.argv.slice(2);
  const pullNumber = Number(pullNumberRaw);

  if (isNaN(pullNumber)) {
    throw new Error(`Invalid pull request number: ${pullNumberRaw}`);
  }

  let repoClient: Octokit | null = null;
  let googlersOrgClient: Octokit | null = null;

  try {
    const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2);

    // Authenticate using the Angular Robot app for the repository
    const repoToken = await getAuthTokenFor(ANGULAR_ROBOT, {owner, repo});
    repoClient = new Octokit({auth: repoToken});

    // Get pull request details to find the author
    const pr = await repoClient.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });
    const author = pr.data.user.login;

    core.info(`PR #${pullNumber} author is: ${author}`);

    // Authenticate using the Angular Robot app for the googlers organization
    const googlersOrgToken = await getGooglersOrgInstallationToken();
    if (googlersOrgToken === null) {
      throw new Error('Could not retrieve installation token for `googlers` org.');
    }
    googlersOrgClient = new Octokit({auth: googlersOrgToken});

    const isMember = await isGooglerOrgMember(googlersOrgClient, author);

    if (isMember) {
      core.info(`PR author ${author} is a member of the googlers organization.`);
      return;
    }

    core.info(`PR author ${author} is NOT a member of the googlers organization.`);

    // Check if the label is present on the PR before attempting to remove it
    const labels = pr.data.labels.map((l) => l.name);
    if (!labels.includes(labelName)) {
      core.info(`Label "${labelName}" is not present on the PR.`);
      return;
    }

    core.info(`Removing label "${labelName}" from PR #${pullNumber}...`);
    await repoClient.issues.removeLabel({
      owner,
      repo,
      issue_number: pullNumber,
      name: labelName,
    });
    core.info(`Successfully removed label "${labelName}"`);
  } finally {
    if (googlersOrgClient !== null) {
      await revokeActiveInstallationToken(googlersOrgClient);
    }
    if (repoClient !== null) {
      await revokeActiveInstallationToken(repoClient);
    }
  }
}

async function getGooglersOrgInstallationToken(): Promise<string | null> {
  try {
    return await getAuthTokenFor(ANGULAR_ROBOT, {
      org: 'googlers',
    });
  } catch (e) {
    core.error('Could not retrieve installation token for `googlers` org.');
    core.error(e as Error);
  }
  return null;
}

const isGooglerOrgMemberCache = new Map<string, boolean>();

async function isGooglerOrgMember(client: Octokit, username: string): Promise<boolean> {
  if (isGooglerOrgMemberCache.has(username)) {
    return isGooglerOrgMemberCache.get(username)!;
  }
  return await client.orgs
    .checkMembershipForUser({org: 'googlers', username})
    .then(
      ({status}) => (status as number) === 204,
      () => false,
    )
    .then((result) => {
      isGooglerOrgMemberCache.set(username, result);
      return result;
    });
}

main().catch((e) => {
  core.setFailed(e.message);
});
