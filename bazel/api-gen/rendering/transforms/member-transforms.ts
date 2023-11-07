/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MemberEntry} from '../entities';
import {isClassMethodEntry} from '../entities/categorization';
import {MemberEntryRenderable} from '../entities/renderables';
import {HasMembers, HasRenderableMembers, HasRenderableMembersGroups} from '../entities/traits';
import {skipLifecycleHooks} from '../helpers/code';
import {addHtmlDescription, addHtmlJsDocTagComments, setIsDeprecated} from './jsdoc-transforms';

/** Given an entity with members, gets the entity augmented with renderable members. */
export function addRenderableGroupMembers<T extends HasMembers>(
  entry: T,
): T & HasRenderableMembersGroups {
  const membersGroups = skipLifecycleHooks(entry.members).reduce((groups, item) => {
    const member = setIsDeprecated(
      addMethodParamsDescription(addHtmlDescription(addHtmlJsDocTagComments(item))),
    );
    if (groups.has(member.name)) {
      const group = groups.get(member.name);
      group?.push(member);
    } else {
      groups.set(member.name, [member]);
    }
    return groups;
  }, new Map<string, MemberEntryRenderable[]>());

  return {
    ...entry,
    membersGroups,
  };
}

export function addRenderableMembers<T extends HasMembers>(entry: T): T & HasRenderableMembers {
  const members = entry.members.map((entry) =>
    setIsDeprecated(addMethodParamsDescription(addHtmlDescription(addHtmlJsDocTagComments(entry)))),
  );

  return {
    ...entry,
    members,
  };
}

function addMethodParamsDescription<T extends MemberEntry>(entry: T): T {
  if (isClassMethodEntry(entry)) {
    return {
      ...entry,
      params: entry.params.map((param) => addHtmlDescription(param)),
    };
  }
  return entry;
}
