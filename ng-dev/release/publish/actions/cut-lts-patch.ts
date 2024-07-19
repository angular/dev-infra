/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Prompt} from '../../../utils/prompt.js';
import {semverInc} from '../../../utils/semver.js';
import {ActiveReleaseTrains} from '../../versioning/active-release-trains.js';
import {
  fetchLongTermSupportBranchesFromNpm,
  LtsBranch,
} from '../../versioning/long-term-support.js';
import {ReleaseAction} from '../actions.js';

/**
 * Release action that cuts a new patch release for an active release-train in the long-term
 * support phase. The patch segment is incremented. The changelog is generated for the new
 * patch version, but also needs to be cherry-picked into the next development branch.
 */
export class CutLongTermSupportPatchAction extends ReleaseAction {
  /** Promise resolving an object describing long-term support branches. */
  ltsBranches = fetchLongTermSupportBranchesFromNpm(this.config);

  override async getDescription() {
    const {active} = await this.ltsBranches;
    return `Cut a new release for an active LTS branch (${active.length} active).`;
  }

  override async perform() {
    const ltsBranch = await this._promptForTargetLtsBranch();
    const newVersion = semverInc(ltsBranch.version, 'patch');
    const compareVersionForReleaseNotes = ltsBranch.version;

    const {pullRequest, releaseNotes, builtPackagesWithInfo, beforeStagingSha} =
      await this.checkoutBranchAndStageVersion(
        newVersion,
        compareVersionForReleaseNotes,
        ltsBranch.name,
      );

    await this.promptAndWaitForPullRequestMerged(pullRequest);
    await this.publish(
      builtPackagesWithInfo,
      releaseNotes,
      beforeStagingSha,
      ltsBranch.name,
      ltsBranch.npmDistTag,
      {showAsLatestOnGitHub: false},
    );
    await this.cherryPickChangelogIntoNextBranch(releaseNotes, ltsBranch.name);
  }

  /** Prompts the user to select an LTS branch for which a patch should but cut. */
  private async _promptForTargetLtsBranch(): Promise<LtsBranch> {
    const {active, inactive} = await this.ltsBranches;
    const activeBranchChoices: {name: string; value: LtsBranch | null}[] = active.map((branch) =>
      this._getChoiceForLtsBranch(branch),
    );
    const inactiveBranchChoices = inactive.map((branch) => this._getChoiceForLtsBranch(branch));

    // If there are inactive LTS branches, we allow them to be selected. In some situations,
    // patch releases are still cut for inactive LTS branches. e.g. when the LTS duration
    // has been increased due to exceptional events ()
    if (inactive.length !== 0) {
      activeBranchChoices.push({name: 'Inactive LTS versions (not recommended)', value: null});
    }

    const activeLtsBranch = await Prompt.select<LtsBranch | null>({
      message: 'Please select a version for which you want to cut an LTS patch',
      choices: activeBranchChoices,
    });
    if (activeLtsBranch) {
      return activeLtsBranch;
    }
    return await Prompt.select<LtsBranch>({
      message: 'Please select an inactive LTS version for which you want to cut an LTS patch',
      choices: inactiveBranchChoices,
    });
  }

  /** Gets an inquirer choice for the given LTS branch. */
  private _getChoiceForLtsBranch(branch: LtsBranch): {name: string; value: LtsBranch} {
    return {name: `v${branch.version.major} (from ${branch.name})`, value: branch};
  }

  static override async isActive(_active: ActiveReleaseTrains) {
    // LTS patch versions can be only cut if there are release trains in LTS phase.
    // This action is always selectable as we support publishing of old LTS branches,
    // and have prompt for selecting an LTS branch when the action performs.
    return true;
  }
}
