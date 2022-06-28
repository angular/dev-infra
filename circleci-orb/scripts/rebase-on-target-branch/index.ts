#!/usr/bin/env node

import {execSync as execSync_} from 'child_process';

// CircleCI environmental variables.
const baseRevision = process.env.CIRCLE_GIT_BASE_REVISION!;
const baseRepoOwner = process.env.CIRCLE_PROJECT_USERNAME!;
const baseRepoName = process.env.CIRCLE_PROJECT_REPONAME!;
const headRevision = process.env.CIRCLE_GIT_HEAD_REVISION!;
const headRepoOwner = process.env.CIRCLE_PR_USERNAME!;
const headRepoName = process.env.CIRCLE_PR_REPONAME!;
const prNumber = process.env.CIRCLE_PR_NUMBER!;
const primaryBranchName = process.env.MAIN_BRANCH_NAME!;

/** A regex to select a ref that matches our semver refs. */
const semverRegex = /^(\d+)\.(\d+)\.x$/;

/** Synchronously executes the command, suppressing errors as empty string outputs. */
function exec(command: string): string {
  try {
    return execSync_(command, {stdio: 'pipe', encoding: 'utf8'}).trim();
  } catch (err: unknown) {
    return '';
  }
}

/**
 * Sort a list of fullpath refs into a list and then provide the first entry.
 *
 * The sort order will first find primary branch ref, and then any semver ref, followed
 * by the rest of the refs in the order provided.
 *
 * Branches are sorted in this order as work is primarily done on one primary branch, and
 * otherwise on a semver branch. If neither of those were to match, the most
 * likely correct branch will be the first one encountered in the list.
 */
function getRefFromBranchList(gitOutput: string) {
  const branches = gitOutput.split('\n').map((b) => b.split('/').slice(1).join('').trim());
  return branches.sort((a: string, b: string) => {
    if (a === primaryBranchName) {
      return -1;
    }
    if (b === primaryBranchName) {
      return 1;
    }
    const aIsSemver = semverRegex.test(a);
    const bIsSemver = semverRegex.test(b);
    if (aIsSemver && bIsSemver) {
      const [, aMajor, aMinor] = a.match(semverRegex)!;
      const [, bMajor, bMinor] = b.match(semverRegex)!;
      return (
        parseInt(bMajor, 10) - parseInt(aMajor, 10) ||
        parseInt(aMinor, 10) - parseInt(bMinor, 10) ||
        0
      );
    }
    if (aIsSemver) {
      return -1;
    }
    if (bIsSemver) {
      return 1;
    }
    return 0;
  })[0];
}

/** Get the full sha of the ref provided. */
function getShaFromRef(ref: string) {
  return exec(`git rev-parse ${ref}`);
}

/**
 * Get the list of branches which contain the provided sha, sorted in descending order
 * by committerdate.
 *
 * example:
 *   upstream/main
 *   upstream/9.0.x
 *   upstream/test
 *   upstream/1.1.x
 */
function getBranchListForSha(sha: string, remote: string) {
  return exec(`git branch -r '${remote}/*' --sort=-committerdate --contains ${sha}`);
}

/** Get the common ancestor sha of the two provided shas. */
function getCommonAncestorSha(sha1: string, sha2: string) {
  return exec(`git merge-base ${sha1} ${sha2}`);
}

/** * Adds the remote to git, if it doesn't already exist. */
function addAndFetchRemote(owner: string, name: string) {
  const remoteName = `${owner}_${name}`;
  exec(`git remote add ${remoteName} https://github.com/${owner}/${name}.git`);
  exec(`git fetch ${remoteName}`);
  return remoteName;
}

/** Get the ref and latest shas for the provided sha on a specific remote. */
function getRefAndShas(sha: string, owner: string, name: string) {
  const remote = addAndFetchRemote(owner, name);
  // Get the ref on the remote for the sha provided.
  const ref = getRefFromBranchList(getBranchListForSha(sha, remote));
  // Get the latest sha on the discovered remote ref.
  const latestSha = getShaFromRef(`${remote}/${ref}`);

  return {remote, ref, latestSha, sha};
}

/** Rebase on the latest commit for the targetted branch. */
(async () => {
  const base = getRefAndShas(baseRevision, baseRepoOwner, baseRepoName);
  const target = getRefAndShas(headRevision, headRepoOwner, headRepoName);
  const commonAncestorSha = getCommonAncestorSha(base.sha, target.sha);

  // Log known refs and shas
  console.log(`--------------------------------`);
  console.log(`    Target Branch:                   ${base.ref}`);
  console.log(`    Latest Commit for Target Branch: ${target.latestSha}`);
  console.log(`    Latest Commit for PR:            ${base.latestSha}`);
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
          git checkout ${target.ref};
          git rebase upstream/${base.ref};
          git push --force-with-lease;

        Angular team members can rebase this PR with the following command:
          yarn ng-dev pr rebase ${prNumber ? prNumber : '<pr-number>'}
        `);
  } else {
    console.log('No change found in the CircleCI config file, continuing.');
  }
  console.log();

  // Rebase the PR.
  exec(`git rebase origin/${base.ref}`);
  console.log(`Rebased current branch onto ${base.ref}.`);
})().catch((err: unknown) => {
  console.log('Failed to rebase on top of target branch.\n');
  console.error(err);
  process.exitCode = 1;
});
