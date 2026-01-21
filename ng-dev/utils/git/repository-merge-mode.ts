/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../logging';
import {AuthenticatedGitClient} from './authenticated-git-client';

const mergeModePropertyName = 'merge-mode';

/** The merge modes repositories can defined as their normal merge mode. */
export const RepositoryMergeMode = {
  TEAM_ONLY: 'team-only',
  CARETAKER_ONLY: 'caretaker-only',
} as const;
export type RepositoryMergeMode = (typeof RepositoryMergeMode)[keyof typeof RepositoryMergeMode];

export const MergeMode = {
  ...RepositoryMergeMode,
  RELEASE: 'release',
} as const;
export type MergeMode = (typeof MergeMode)[keyof typeof MergeMode];

const mergeModes = Object.values(MergeMode);

export async function getCurrentMergeMode(): Promise<MergeMode> {
  const git = await AuthenticatedGitClient.get();

  const {data: properties} = await git.github.repos.customPropertiesForReposGetRepositoryValues({
    owner: git.remoteConfig.owner,
    repo: git.remoteConfig.name,
  });

  const property = properties.find(({property_name}) => property_name === mergeModePropertyName);
  if (property === undefined) {
    throw Error(`No repository configuration value with the key: ${mergeModePropertyName}`);
  }

  // We safely cast this as a MergeMode since we know that `merge-mode` is a single-select and
  // therefore one of the valid strings.
  return property.value as MergeMode;
}

export async function setRepoMergeMode(value: MergeMode) {
  const currentValue = await getCurrentMergeMode();
  if (currentValue === value) {
    Log.debug(
      'Skipping update of repository configuration value as it is already set to the provided value',
    );
    return false;
  }
  const git = await AuthenticatedGitClient.get();
  if (!mergeModes.includes(value)) {
    throw Error(
      `Unable to update ${mergeModePropertyName}. The value provided must use one of: ` +
        `${mergeModes.join(', ')}\nBut "${value}" was provided as the value`,
    );
  }

  // All members of the github team, `team` have been assigned the custom role `Custom Property
  // Editor` allowing their accounts to update the values the custom properties in Angular repos.
  await git.github.repos.customPropertiesForReposCreateOrUpdateRepositoryValues({
    owner: git.remoteConfig.owner,
    repo: git.remoteConfig.name,
    properties: [
      {
        property_name: mergeModePropertyName,
        value,
      },
    ],
  });

  return true;
}
