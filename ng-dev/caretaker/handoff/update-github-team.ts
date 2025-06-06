/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Prompt} from '../../utils/prompt.js';
import {getConfig, assertValidCaretakerConfig} from '../../utils/config.js';

import {green, Log} from '../../utils/logging.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';

/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
export async function updateCaretakerTeamViaPrompt() {
  /** Caretaker specific configuration. */
  const config = await getConfig([assertValidCaretakerConfig]);
  const {caretakerGroup} = config.caretaker;

  if (caretakerGroup === undefined) {
    throw Error('`caretakerGroup` is not defined in the `caretaker` config');
  }

  /** The list of current members in the group. */
  const current = new Set(await getGroupMembers(caretakerGroup));
  const [roster, emeaRoster] = await Promise.all([
    getGroupMembers(`${caretakerGroup}-roster`),
    getGroupMembers(`${caretakerGroup}-roster-emea`),
  ]);

  /** The list of users selected to be members of the caretaker group. */
  const selectedPrimaryAndSecondary = await Prompt.checkbox<string>({
    choices: roster.map((member) => ({
      value: member,
      checked: current.has(member),
    })),
    message: 'Select 2 caretakers for the upcoming rotation (primary and secondary):',
    validate: (value) => {
      if (value.length !== 2) {
        return 'Please select exactly 2 caretakers for the upcoming rotation.';
      }
      return true;
    },
  });

  const emeaOptions = emeaRoster
    // Do not show members that are already selected as primary/secondary.
    .filter((m) => !selectedPrimaryAndSecondary.includes(m))
    .map((member) => ({
      value: member,
      name: `${member} (EMEA)`,
      checked: current.has(member),
    }));
  const selectedEmea = await Prompt.select<string>({
    choices: emeaOptions,
    message: 'Select EMEA caretaker',
  });

  /** Whether the user positively confirmed the selected made. */
  const confirmation = await Prompt.confirm({
    default: true,
    message: 'Are you sure?',
  });

  if (confirmation === false) {
    Log.warn('  ⚠  Skipping caretaker group update.');
    return;
  }

  const selectedSorted = [...selectedPrimaryAndSecondary, selectedEmea].sort();
  const currentSorted = Array.from(current).sort();

  if (JSON.stringify(selectedSorted) === JSON.stringify(currentSorted)) {
    Log.info(green('  ✔  Caretaker group already up to date.'));
    return;
  }

  try {
    await setCaretakerGroup(caretakerGroup, selectedSorted);
  } catch {
    Log.error('  ✘  Failed to update caretaker group.');
    return;
  }
  Log.info(green('  ✔  Successfully updated caretaker group'));
}

/** Retrieve the current list of members for the provided group. */
async function getGroupMembers(group: string) {
  /** The authenticated GitClient instance. */
  const git = await AuthenticatedGitClient.get();

  return (
    await git.github.teams.listMembersInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
    })
  ).data
    .filter((_) => !!_)
    .map((member) => member!.login);
}

async function setCaretakerGroup(group: string, members: string[]) {
  /** The authenticated GitClient instance. */
  const git = await AuthenticatedGitClient.get();
  /** The full name of the group <org>/<group name>. */
  const fullSlug = `${git.remoteConfig.owner}/${group}`;
  /** The list of current members of the group. */
  const current = await getGroupMembers(group);
  /** The list of users to be removed from the group. */
  const removed = current.filter((login) => !members.includes(login));
  /** Add a user to the group. */
  const add = async (username: string) => {
    Log.debug(`Adding ${username} to ${fullSlug}.`);
    await git.github.teams.addOrUpdateMembershipForUserInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
      username,
      role: 'maintainer',
    });
  };
  /** Remove a user from the group. */
  const remove = async (username: string) => {
    Log.debug(`Removing ${username} from ${fullSlug}.`);
    await git.github.teams.removeMembershipForUserInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
      username,
    });
  };

  Log.debug.group(`Caretaker Group: ${fullSlug}`);
  Log.debug(`Current Membership: ${current.join(', ')}`);
  Log.debug(`New Membership:     ${members.join(', ')}`);
  Log.debug(`Removed:            ${removed.join(', ')}`);
  Log.debug.groupEnd();

  // Add members before removing to prevent the account performing the action from removing their
  // permissions to change the group membership early.
  await Promise.all(members.map(add));
  await Promise.all(removed.map(remove));

  Log.debug(green(`Successfully updated ${fullSlug}`));
}
