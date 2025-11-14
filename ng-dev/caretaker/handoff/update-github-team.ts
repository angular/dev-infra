/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Prompt} from '../../utils/prompt.js';
import {
  getConfig,
  assertValidCaretakerConfig,
  assertValidGithubConfig,
} from '../../utils/config.js';

import {green, Log} from '../../utils/logging.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';

/** Update the Github caretaker group, using a prompt to obtain the new caretaker group members.  */
export async function updateCaretakerTeamViaPrompt() {
  /** Caretaker specific configuration. */
  const config = await getConfig([assertValidCaretakerConfig, assertValidGithubConfig]);
  /** The github team name for the caretaker group. */
  const caretakerGroup = `${config.github.name}-caretaker`;
  /** The github team name for the group containing the repository releaser. */
  const releaserGroup = `${config.github.name}-releaser`;
  /** The github team name for the group containing all possible caretakers. */
  const caretakerGroupRoster = `${config.github.name}-caretaker-roster`;
  /** The github team name for the group containing all possible emea caretakers. */
  const caretakerGroupEmeaRoster = `${config.github.name}-caretaker-roster-emea`;

  /** A set of the current caretakers in the {@link caretakerGroup}} */
  const current = new Set(await getGroupMembers(caretakerGroup));
  /** A list of the team members in the {@link caretakerGroupRoster}} */
  const roster = await getGroupMembers(caretakerGroupRoster);
  /** A list of the team members in the {@link caretakerGroupEmeaRoster}} */
  const emeaRoster = await getGroupMembers(caretakerGroupEmeaRoster);

  if (roster.length === 0) {
    return Log.error(`  ✘  Unable to retrieve members of the group: ${caretakerGroupRoster}`);
  }

  /** The set of users selected to be members of the caretaker group. */
  const selected = new Set(
    await Prompt.checkbox<string>({
      choices: roster.map((member) => ({
        value: member,
        checked: current.has(member),
      })),
      message:
        'Select 2 caretakers for the upcoming rotation (primary and secondary, http://go/ng-caretakers):',
      validate: (value) => {
        if (value.length !== 2) {
          return 'Please select exactly 2 caretakers for the upcoming rotation.';
        }
        return true;
      },
    }),
  );

  if (config.caretaker.hasEmeaCaretaker) {
    selected.add(
      await Prompt.select<string>({
        choices: emeaRoster.map((value) => ({value})),
        message: 'Select EMEA caretaker (http://go/ng-caretaker-schedule-emea)',
      }),
    );
  }

  if (!(await Prompt.confirm({default: true, message: 'Are you sure?'}))) {
    return Log.warn('  ⚠  Skipping caretaker group update.');
  }

  if (JSON.stringify(Array.from(selected).sort()) === JSON.stringify(Array.from(current).sort())) {
    return Log.info(green('  ✔  Caretaker group already up to date.'));
  }

  try {
    await setGithubTeam(caretakerGroup, Array.from(selected));
    await setGithubTeam(releaserGroup, Array.from(selected));
  } catch {
    return Log.error('  ✘  Failed to update caretaker group.');
  }
  Log.info(green('  ✔  Successfully updated caretaker group'));
}

/** Retrieve the current list of members for the provided group. */
async function getGroupMembers(group: string) {
  /** The authenticated GitClient instance. */
  const git = await AuthenticatedGitClient.get();
  try {
    return await git.github.teams
      .listMembersInOrg({
        org: git.remoteConfig.owner,
        team_slug: group,
      })
      .then(({data}) => data.map((member) => member.login));
  } catch (e) {
    Log.debug(e);
    return [];
  }
}

async function setGithubTeam(group: string, members: string[]) {
  /** The authenticated GitClient instance. */
  const git = await AuthenticatedGitClient.get();
  /** The full name of the group <org>/<group name>. */
  const fullSlug = `${git.remoteConfig.owner}/${group}`;
  /** The list of current members of the group. */
  const current = (await getGroupMembers(group)) || [];
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

  Log.debug(`Github Team: ${fullSlug}`);
  Log.debug(`Current Membership: ${current.join(', ')}`);
  Log.debug(`New Membership:     ${members.join(', ')}`);
  Log.debug(`Removed:            ${removed.join(', ')}`);

  // Add members before removing to prevent the account performing the action from removing their
  // permissions to change the group membership early.
  await Promise.all(members.map(add));
  await Promise.all(removed.map(remove));

  Log.debug(green(`Successfully updated ${fullSlug}`));
}
