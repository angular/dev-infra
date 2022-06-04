/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {prompt} from 'inquirer';
import {getConfig} from '../../utils/config';

import {green, Log, yellow} from '../../utils/logging';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {assertValidCaretakerConfig} from '../config';

/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
export async function updateCaretakerTeamViaPrompt() {
  /** Caretaker specific configuration. */
  const config = getConfig();
  assertValidCaretakerConfig(config);
  const {caretakerGroup} = config.caretaker;

  if (caretakerGroup === undefined) {
    throw Error('`caretakerGroup` is not defined in the `caretaker` config');
  }

  /** The list of current members in the group. */
  const current = await getGroupMembers(caretakerGroup);
  /** The list of members able to be added to the group as defined by a separate roster group. */
  const roster = await getGroupMembers(`${caretakerGroup}-roster`);
  const {
    /** The list of users selected to be members of the caretaker group. */
    selected,
    /** Whether the user positively confirmed the selected made. */
    confirm,
  } = await prompt([
    {
      type: 'checkbox',
      choices: roster,
      message: 'Select 2 caretakers for the upcoming rotation:',
      default: current,
      name: 'selected',
      prefix: '',
      validate: (value: string[]) => {
        if (value.length !== 2) {
          return 'Please select exactly 2 caretakers for the upcoming rotation.';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      default: true,
      prefix: '',
      message: 'Are you sure?',
      name: 'confirm',
    },
  ]);

  if (confirm === false) {
    Log.warn('  ⚠  Skipping caretaker group update.');
    return;
  }

  if (JSON.stringify(selected) === JSON.stringify(current)) {
    Log.info(green('  √  Caretaker group already up to date.'));
    return;
  }

  try {
    await setCaretakerGroup(caretakerGroup, selected);
  } catch {
    Log.error('  ✘  Failed to update caretaker group.');
    return;
  }
  Log.info(green('  √  Successfully updated caretaker group'));
}

/** Retrieve the current list of members for the provided group. */
async function getGroupMembers(group: string) {
  /** The authenticated GitClient instance. */
  const git = AuthenticatedGitClient.get();

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
  const git = AuthenticatedGitClient.get();
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
