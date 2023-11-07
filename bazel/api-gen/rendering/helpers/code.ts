/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MemberEntry, MemberTags, MemberType} from '../entities';

/** Lifecycle Hooks */
export const LIFECYCLE_HOOKS_NAMES = [
  'ngOnChanges',
  'ngOnInit',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngDoCheck',
  'ngAfterContentChecked',
  'ngAfterViewChecked',
  'ngOnDestroy',
];

/** Split generated code with syntax highlighting into single lines */
export function getLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }
  return text.split(/\r\n|\r|\n/g);
}

/** Lifecycle hooks are not required to display in API Details Page */
export function skipLifecycleHooks(members: MemberEntry[]): MemberEntry[] {
  return members.filter(
    (member) => !LIFECYCLE_HOOKS_NAMES.some((hookName) => hookName === member.name),
  );
}

export function mergeGettersAndSetters(members: MemberEntry[]): MemberEntry[] {
  const getters = new Set<string>();
  const setters = new Set<string>();

  // Note all getter and setter names for the class.
  for (const member of members) {
    if (member.memberType === MemberType.Getter) getters.add(member.name);
    if (member.memberType === MemberType.Setter) setters.add(member.name);
  }

  // Mark getter-only members as `readonly`.
  for (const member of members) {
    if (member.memberType === MemberType.Getter && !setters.has(member.name)) {
      member.memberType = MemberType.Property;
      member.memberTags.push(MemberTags.Readonly);
    }
  }

  // Filter out setters that have a corresponding getter.
  return members.filter(
    (member) => member.memberType !== MemberType.Setter || !getters.has(member.name),
  );
}

export function mapJsDocExampleToHtmlExample(text: string): string {
  const codeExampleAtRule = /{@example (\S+) region=(['"])([^'"]+)\2\s*}/g;

  return text.replaceAll(codeExampleAtRule, (_, path, separator, region) => {
    return `<code-example path="${path}" region="${region}" />`;
  });
}
