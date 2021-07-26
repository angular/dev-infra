/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullApproveGroupResult} from './group';

/** Create logs for each pullapprove group result. */
export function logGroup(group: PullApproveGroupResult, matched = true) {
  const conditions = matched ? group.matchedConditions : group.unmatchedConditions;
  console.groupCollapsed(`[${group.groupName}]`);
  if (conditions.length) {
    conditions.forEach(matcher => {
      const count = matcher.matchedFiles.size;
      console.info(`${count} ${count === 1 ? 'match' : 'matches'} - ${matcher.expression}`)
    });
    console.groupEnd();
  }
}

/** Logs a header within a text drawn box. */
export function logHeader(...params: string[]) {
  const totalWidth = 80;
  const fillWidth = totalWidth - 2;
  const headerText = params.join(' ').substr(0, fillWidth);
  const leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
  const rightSpace = fillWidth - leftSpace - headerText.length;
  const fill = (count: number, content: string) => content.repeat(count);

  console.info(`┌${fill(fillWidth, '─')}┐`);
  console.info(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
  console.info(`└${fill(fillWidth, '─')}┘`);
}
