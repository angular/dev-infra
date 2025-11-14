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

export async function getCurrentMergeMode() {
  const git = await AuthenticatedGitClient.get();

  const {data: properties} = await git.github.repos.customPropertiesForReposGetRepositoryValues({
    owner: git.remoteConfig.owner,
    repo: git.remoteConfig.name,
  });

  const property = properties.find(({property_name}) => property_name === mergeModePropertyName);
  if (property === undefined) {
    throw Error(`No repository configuration value with the key: ${mergeModePropertyName}`);
  }

  // We safely case this as a string since we know that `merge-mode` is a single-select and therefore a string.
  return property.value as string;
}

export async function setRepoMergeMode(value: string) {
  const currentValue = await getCurrentMergeMode();
  if (currentValue === value) {
    Log.debug(
      'Skipping update of repository configuration value as it is already set to the provided value',
    );
    return false;
  }
  const git = await AuthenticatedGitClient.get();
  const {value_type, allowed_values} = await getRepoConfigValueDefinition(
    mergeModePropertyName,
    git,
  );

  if (value_type !== 'single_select') {
    throw Error(
      `Unable to update ${mergeModePropertyName} as its type is ${value_type}, currently the ` +
        `only supported configuration type is single_select`,
    );
  }

  if (!allowed_values!.includes(value)) {
    throw Error(
      `Unable to update ${mergeModePropertyName}. The value provided must use one of: ` +
        `${allowed_values!.join(', ')}\nBut "${value}" was provided as the value`,
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

async function getRepoConfigValueDefinition(key: string, git: AuthenticatedGitClient) {
  return git.github.orgs
    .customPropertiesForReposGetOrganizationDefinition({
      custom_property_name: key,
      org: git.remoteConfig.owner,
    })
    .then(({data}) => data);
}
