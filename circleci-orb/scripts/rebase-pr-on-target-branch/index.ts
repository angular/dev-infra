#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {exec, getCommonAncestorSha, lookupSha} from './helpers';

// Parameter variables.
const baseRevision = process.env.CIRCLE_GIT_BASE_REVISION!;
const headRevision = process.env.CIRCLE_GIT_HEAD_REVISION!;
const primaryBranchName = process.env.MAIN_BRANCH_NAME!;

console.info('Provided variables to Orb script:');
console.info({baseRevision, headRevision, primaryBranchName});

// CircleCI environment variables.
const baseRepoOwner = process.env.CIRCLE_PROJECT_USERNAME!;
const baseRepoName = process.env.CIRCLE_PROJECT_REPONAME!;
const headRepoOwner = process.env.CIRCLE_PR_USERNAME!;
const headRepoName = process.env.CIRCLE_PR_REPONAME!;
const prNumber = process.env.CIRCLE_PR_NUMBER!;

if (!process.env.CIRCLE_PR_NUMBER) {
  console.info('Skipping rebase as the CircleCI run is not for a pull request.');
  process.exit(0);
}

/** Rebase on the latest commit for the targeted branch. */
(async () => {
  const base = lookupSha(baseRevision, baseRepoOwner, baseRepoName, primaryBranchName);
  const head = lookupSha(headRevision, headRepoOwner, headRepoName, primaryBranchName);
  const commonAncestorSha = getCommonAncestorSha(base.sha, head.sha);

  // Log known refs and shas
  console.log(`--------------------------------`);
  console.log(`    Target Branch:                   ${base.ref}`);
  console.log(`    Latest Commit for Target Branch: ${base.latestSha}`);
  console.log(`    Latest Commit for PR:            ${head.latestSha}`);
  console.log(`    First Common Ancestor SHA:       ${commonAncestorSha}`);
  console.log(`--------------------------------`);
  console.log();

  // Get the count of commits between the latest commit from origin and the common ancestor SHA.
  const commitCount = exec(`git rev-list --count origin/${base.ref}...${commonAncestorSha}`);
  console.log(`Checking ${commitCount} commits for changes in the CircleCI config file.`);

  // Check if the files changed between the latest commit from origin and the common ancestor SHA
  // includes the CircleCI config.
  const circleCIConfigChanged = exec(
    `git diff --name-only origin/${base.ref} ${commonAncestorSha} -- .circleci/config.yml`,
  );
  if (!!circleCIConfigChanged) {
    throw Error(`
        CircleCI config on ${base.ref} has been modified since commit
        ${commonAncestorSha.slice(0, 7)}, which this PR is based on.

        Please rebase the PR on ${base.ref} after fetching from upstream.

        Rebase instructions for PR Author, please run the following commands:

          git fetch upstream ${base.ref};
          git checkout ${head.ref};
          git rebase upstream/${base.ref};
          git push --force-with-lease;

        Angular team members can rebase this PR with the following command:
          yarn ng-dev pr rebase ${prNumber}
        `);
  } else {
    console.log('No change found in the CircleCI config file, continuing.');
  }
  console.log();

  // Rebase the PR.
  exec(`git rebase origin/${base.ref}`);
  console.log(`Rebased current branch onto ${base.ref}.`);
})().catch((err: unknown) => {
  console.error('Failed to rebase on top of target branch.');
  console.error(err);
  process.exitCode = 1;
});
