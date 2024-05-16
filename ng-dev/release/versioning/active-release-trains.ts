/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import semver from 'semver';

import {ReleaseTrain} from './release-trains.js';
import {
  getBranchesForMajorVersions,
  getVersionInfoForBranch,
  ReleaseRepoWithApi,
  VersionBranch,
} from './version-branches.js';

interface DeterminationCheckFns {
  canHaveExceptionalMinor: (rc: ReleaseTrain | null) => boolean;
  isValidReleaseCandidateVersion: (v: semver.SemVer) => boolean;
  isValidExceptionalMinorVersion: (v: semver.SemVer, rc: ReleaseTrain | null) => boolean;
}

/** The active release trains for a project. */
export class ActiveReleaseTrains {
  /** Release-train currently in the "release-candidate" or "feature-freeze" phase. */
  readonly releaseCandidate: ReleaseTrain | null = this.trains.releaseCandidate;
  /** Release-train in the `next` phase. */
  readonly next: ReleaseTrain = this.trains.next;
  /** Release-train currently in the "latest" phase. */
  readonly latest: ReleaseTrain = this.trains.latest;
  /** Release-train for an exceptional minor in progress. */
  readonly exceptionalMinor: ReleaseTrain | null = this.trains.exceptionalMinor;

  constructor(
    private trains: {
      releaseCandidate: ReleaseTrain | null;
      exceptionalMinor: ReleaseTrain | null;
      next: ReleaseTrain;
      latest: ReleaseTrain;
    },
  ) {}

  /** Whether the active release trains indicate the repository is in a feature freeze state. */
  isFeatureFreeze() {
    return this.releaseCandidate !== null && this.releaseCandidate.version.prerelease[0] === 'next';
  }

  /** Fetches the active release trains for the configured project. */
  static async fetch(repo: ReleaseRepoWithApi): Promise<ActiveReleaseTrains> {
    return fetchActiveReleaseTrains(repo);
  }
}

/** Fetches the active release trains for the configured project. */
async function fetchActiveReleaseTrains(repo: ReleaseRepoWithApi): Promise<ActiveReleaseTrains> {
  const nextBranchName = repo.nextBranchName;
  const {version: nextVersion} = await getVersionInfoForBranch(repo, nextBranchName);
  const next = new ReleaseTrain(nextBranchName, nextVersion);
  const majorVersionsToFetch: number[] = [];
  const checks: DeterminationCheckFns = {
    canHaveExceptionalMinor: () => false,
    isValidReleaseCandidateVersion: () => false,
    isValidExceptionalMinorVersion: () => false,
  };

  if (nextVersion.minor === 0) {
    // CASE 1: Next is for a new major. Potential release-candidate/feature-freeze train
    // can only be for the previous major. Usually patch is in the same minor as for RC/FF,
    // but technically two majors can be in the works, so we also need to consider the second
    // previous major

    // Example scenarios:
    //    * next = v15.0.x, rc/ff = v14.4.x, exc-minor = disallowed, patch = v14.3.x
    //    * next = v15.0.x  rc/ff = null,    exc-minor = null,       patch = v14.3.x
    //    * next = v15.0.x  rc/ff = null,    exc-minor = v14.4.x,    patch = v14.3.x
    // Cases where two majors are in the works (unlikely- but technically possible)
    //    * next = v15.0.x, rc/ff = v14.0.0, exc-minor = null,       patch = v13.2.x
    //    * next = v15.0.x, rc/ff = v14.0.0, exc-minor = v13.3.x,    patch = v13.2.x
    majorVersionsToFetch.push(nextVersion.major - 1, nextVersion.major - 2);
    checks.isValidReleaseCandidateVersion = (v) => v.major === nextVersion.major - 1;
    checks.canHaveExceptionalMinor = (rc) => rc === null || rc.isMajor;
    checks.isValidExceptionalMinorVersion = (v, rc) =>
      v.major === (rc === null ? nextVersion.major : rc.version.major) - 1;
  } else if (nextVersion.minor === 1) {
    // CASE 2: Next is for the first minor of a major release. Potential release-candidate/feature-freeze
    // train is always guaranteed to be in the same major. Depending on if there is RC/FF, the patch train
    // would be in the same major, or in the previous one. Example scenarios:
    //    * next = v15.1.x, rc/ff = v15.0.x, exc-minor = null,       patch = v14.5.x
    //    * next = v15.1.x, rc/ff = v15.0.x, exc-minor = v14.6.x,    patch = v14.5.x
    //    * next = v15.1.x, rc/ff = null,    exc-minor = disallowed, patch = v15.0.x
    majorVersionsToFetch.push(nextVersion.major, nextVersion.major - 1);
    checks.isValidReleaseCandidateVersion = (v) => v.major === nextVersion.major;
    checks.canHaveExceptionalMinor = (rc) => rc !== null && rc.isMajor;
    checks.isValidExceptionalMinorVersion = (v, rc) => v.major === rc!.version.major - 1;
  } else {
    // CASE 3: Next for a normal minor (other cases as above). Potential release-candidate/feature-freeze
    // train and the patch train are always guaranteed to be in the same major. Example scenarios:
    //    * next = v15.2.x, rc/ff = v15.1.x, exc-minor = disallowed, patch = v15.0.x
    //    * next = v15.2.x, rc/ff = null,    exc-minor = disallowed, patch = v15.1.x
    majorVersionsToFetch.push(nextVersion.major);
    checks.isValidReleaseCandidateVersion = (v) => v.major === nextVersion.major;
    checks.canHaveExceptionalMinor = () => false;
  }

  // Collect all version-branches that should be considered for the latest version-branch,
  // a potential exceptional minor train or feature-freeze/release-candidate train.
  const branches = await getBranchesForMajorVersions(repo, majorVersionsToFetch);
  const {latest, releaseCandidate, exceptionalMinor} =
    await findActiveReleaseTrainsFromVersionBranches(repo, next, branches, checks);

  if (latest === null) {
    throw Error(
      `Unable to determine the latest release-train. The following branches ` +
        `have been considered: [${branches.map((b) => b.name).join(', ')}]`,
    );
  }

  return new ActiveReleaseTrains({releaseCandidate, next, latest, exceptionalMinor});
}

/** Finds the currently active release trains from the specified version branches. */
async function findActiveReleaseTrainsFromVersionBranches(
  repo: ReleaseRepoWithApi,
  next: ReleaseTrain,
  branches: VersionBranch[],
  checks: DeterminationCheckFns,
): Promise<{
  latest: ReleaseTrain | null;
  releaseCandidate: ReleaseTrain | null;
  exceptionalMinor: ReleaseTrain | null;
}> {
  // Version representing the release-train currently in the next phase. Note that we ignore
  // patch and pre-release segments in order to be able to compare the next release train to
  // other release trains from version branches (which follow the `N.N.x` pattern).
  const nextReleaseTrainVersion = semver.parse(`${next.version.major}.${next.version.minor}.0`)!;
  const nextBranchName = repo.nextBranchName;

  let latest: ReleaseTrain | null = null;
  let releaseCandidate: ReleaseTrain | null = null;
  let exceptionalMinor: ReleaseTrain | null = null;

  // Iterate through the captured branches and find the latest non-prerelease branch and a
  // potential release candidate branch. From the collected branches we iterate descending
  // order (most recent semantic version-branch first). The first branch is either the latest
  // active version branch (i.e. patch), a feature-freeze/release-candidate branch (ff/rc) or
  // an in-progress exceptional minor:
  //   * A FF/RC or exceptional minor branch cannot be more recent than the current next
  //     version-branch, so we stop iterating once we found such a branch.
  //   * As soon as we discover a version-branch not being an RC/FF or exceptional minor,
  //     we know it is the active patch branch. We stop looking further.
  //   * If we find a FF/RC branch, we continue looking for the next version-branch as
  //     that one has to be an exceptional minor, or the latest active version-branch.
  for (const {name, parsed} of branches) {
    // It can happen that version branches have been accidentally created which are more recent
    // than the release-train in the next branch (i.e. `main`). We could ignore such branches
    // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
    // accidentally created branch by the caretaker. In either way we want to raise awareness.
    if (semver.gt(parsed, nextReleaseTrainVersion)) {
      throw Error(
        `Discovered unexpected version-branch "${name}" for a release-train that is ` +
          `more recent than the release-train currently in the "${nextBranchName}" branch. ` +
          `Please either delete the branch if created by accident, or update the outdated ` +
          `version in the next branch (${nextBranchName}).`,
      );
    } else if (semver.eq(parsed, nextReleaseTrainVersion)) {
      throw Error(
        `Discovered unexpected version-branch "${name}" for a release-train that is already ` +
          `active in the "${nextBranchName}" branch. Please either delete the branch if ` +
          `created by accident, or update the version in the next branch (${nextBranchName}).`,
      );
    }

    const {version, isExceptionalMinor} = await getVersionInfoForBranch(repo, name);
    const releaseTrain = new ReleaseTrain(name, version);
    const isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';

    if (isExceptionalMinor) {
      if (exceptionalMinor !== null) {
        throw Error(
          `Unable to determine latest release-train. Found an additional exceptional minor ` +
            `version branch: "${name}". Already discovered: ${exceptionalMinor.branchName}.`,
        );
      }
      if (!checks.canHaveExceptionalMinor(releaseCandidate)) {
        throw Error(
          `Unable to determine latest release-train. Found an unexpected exceptional minor ` +
            `version branch: "${name}". No exceptional minor is currently allowed.`,
        );
      }
      if (!checks.isValidExceptionalMinorVersion(version, releaseCandidate)) {
        throw Error(
          `Unable to determine latest release-train. Found an invalid exceptional ` +
            `minor version branch: "${name}". Invalid version: ${version}.`,
        );
      }
      exceptionalMinor = releaseTrain;
      continue;
    }

    if (isPrerelease) {
      if (exceptionalMinor !== null) {
        throw Error(
          `Unable to determine latest release-train. Discovered a feature-freeze/release-candidate ` +
            `version branch (${name}) that is older than an in-progress exceptional ` +
            `minor (${exceptionalMinor.branchName}).`,
        );
      }
      if (releaseCandidate !== null) {
        throw Error(
          `Unable to determine latest release-train. Found two consecutive ` +
            `pre-release version branches. No exceptional minors are allowed currently, and ` +
            `there cannot be multiple feature-freeze/release-candidate branches: "${name}".`,
        );
      }
      if (!checks.isValidReleaseCandidateVersion(version)) {
        throw Error(
          `Discovered unexpected old feature-freeze/release-candidate branch. Expected no ` +
            `version-branch in feature-freeze/release-candidate mode for v${version.major}.`,
        );
      }
      releaseCandidate = releaseTrain;
      continue;
    }

    // The first non-prerelease and non-exceptional-minor branch is always picked up
    // as the release-train for `latest`. Once we discovered the latest release train,
    // we skip looking further as there are no possible older active release trains.
    latest = releaseTrain;
    break;
  }

  return {releaseCandidate: releaseCandidate, exceptionalMinor, latest};
}
