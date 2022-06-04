/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidReleaseConfig, ReleaseConfig} from '../../../release/config/index';
import {
  ActiveReleaseTrains,
  getNextBranchName,
  isVersionBranch,
  ReleaseRepoWithApi,
} from '../../../release/versioning';
import {assertValidGithubConfig, ConfigValidationError, GithubConfig} from '../../../utils/config';
import {
  InvalidTargetBranchError,
  InvalidTargetLabelError,
  TargetLabel,
  TargetLabelName,
} from './target-label';

import {assertActiveLtsBranch} from './lts-branch';
import {GithubClient} from '../../../utils/git/github';
import {Log} from '../../../utils/logging';

/**
 * Gets a list of target labels which should be considered by the merge
 * tooling when a pull request is processed to be merged.
 *
 * The target labels are implemented according to the design document which
 * specifies versioning, branching and releasing for the Angular organization:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of a Github client. Used to query for the release train branches.
 * @param config Configuration for the Github remote and release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
export async function getTargetLabelsForActiveReleaseTrains(
  {latest, releaseCandidate, next}: ActiveReleaseTrains,
  api: GithubClient,
  config: Partial<{github: GithubConfig; release: ReleaseConfig}>,
): Promise<TargetLabel[]> {
  assertValidGithubConfig(config);

  const nextBranchName = getNextBranchName(config.github);
  const repo: ReleaseRepoWithApi = {
    owner: config.github.owner,
    name: config.github.name,
    nextBranchName,
    api,
  };

  const targetLabels: TargetLabel[] = [
    {
      name: TargetLabelName.MAJOR,
      branches: () => {
        // If `next` is currently not designated to be a major version, we do not
        // allow merging of PRs with `target: major`.
        if (!next.isMajor) {
          throw new InvalidTargetLabelError(
            `Unable to merge pull request. The "${nextBranchName}" branch will be released as ` +
              'a minor version.',
          );
        }
        return [nextBranchName];
      },
    },
    {
      name: TargetLabelName.MINOR,
      // Changes labeled with `target: minor` are merged most commonly into the next branch
      // (i.e. `main`). In rare cases of an exceptional minor version while being
      // already on a major release train, this would need to be overridden manually.
      // TODO: Consider handling this automatically by checking if the NPM version matches
      // the last-minor. If not, then an exceptional minor might be in progress. See:
      // https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU/edit#heading=h.h7o5pjq6yqd0
      branches: () => [nextBranchName],
    },
    {
      name: TargetLabelName.PATCH,
      branches: (githubTargetBranch) => {
        // If a PR is targeting the latest active version-branch through the Github UI,
        // and is also labeled with `target: patch`, then we merge it directly into the
        // branch without doing any cherry-picking. This is useful if a PR could not be
        // applied cleanly, and a separate PR for the patch branch has been created.
        if (githubTargetBranch === latest.branchName) {
          return [latest.branchName];
        }
        // Otherwise, patch changes are always merged into the next and patch branch.
        const branches = [nextBranchName, latest.branchName];
        // Additionally, if there is a release-candidate/feature-freeze release-train
        // currently active, also merge the PR into that version-branch.
        if (releaseCandidate !== null) {
          branches.push(releaseCandidate.branchName);
        }
        return branches;
      },
    },
    {
      name: TargetLabelName.RELEASE_CANDIDATE,
      branches: (githubTargetBranch) => {
        // The `target: rc` label cannot be applied if there is no active feature-freeze
        // or release-candidate release train.
        if (releaseCandidate === null) {
          throw new InvalidTargetLabelError(
            `No active feature-freeze/release-candidate branch. ` +
              `Unable to merge pull request using "target: rc" label.`,
          );
        }
        // If the PR is targeting the active release-candidate/feature-freeze version branch
        // directly through the Github UI and has the `target: rc` label applied, merge it
        // only into the release candidate branch. This is useful if a PR did not apply cleanly
        // into the release-candidate/feature-freeze branch, and a separate PR has been created.
        if (githubTargetBranch === releaseCandidate.branchName) {
          return [releaseCandidate.branchName];
        }
        // Otherwise, merge into the next and active release-candidate/feature-freeze branch.
        return [nextBranchName, releaseCandidate.branchName];
      },
    },
  ];

  // LTS branches can only be determined if the release configuration is defined, and must be added
  // after asserting the configuration contains a release config.
  try {
    assertValidReleaseConfig(config);
    targetLabels.push({
      // LTS changes are rare enough that we won't worry about cherry-picking changes into all
      // active LTS branches for PRs created against any other branch. Instead, PR authors need
      // to manually create separate PRs for desired LTS branches. Additionally, active LT branches
      // commonly diverge quickly. This makes cherry-picking not an option for LTS changes.
      name: TargetLabelName.LONG_TERM_SUPPORT,
      branches: async (githubTargetBranch) => {
        if (!isVersionBranch(githubTargetBranch)) {
          throw new InvalidTargetBranchError(
            `PR cannot be merged as it does not target a long-term support ` +
              `branch: "${githubTargetBranch}"`,
          );
        }
        if (githubTargetBranch === latest.branchName) {
          throw new InvalidTargetBranchError(
            `PR cannot be merged with "target: lts" into patch branch. ` +
              `Consider changing the label to "target: patch" if this is intentional.`,
          );
        }
        if (releaseCandidate !== null && githubTargetBranch === releaseCandidate.branchName) {
          throw new InvalidTargetBranchError(
            `PR cannot be merged with "target: lts" into feature-freeze/release-candidate ` +
              `branch. Consider changing the label to "target: rc" if this is intentional.`,
          );
        }
        // Assert that the selected branch is an active LTS branch.
        assertValidReleaseConfig(config);
        await assertActiveLtsBranch(repo, config.release, githubTargetBranch);
        return [githubTargetBranch];
      },
    });
  } catch (err) {
    if (err instanceof ConfigValidationError) {
      Log.debug('LTS target label not included in target labels as no valid release');
      Log.debug('configuration was found to allow the LTS branches to be determined.');
    } else {
      throw err;
    }
  }

  return targetLabels;
}
