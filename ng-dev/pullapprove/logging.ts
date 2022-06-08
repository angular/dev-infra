/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Log} from '../utils/logging.js';
import {PullApproveGroupResult} from './group.js';

type ConditionGrouping = keyof Pick<
  PullApproveGroupResult,
  'matchedConditions' | 'unmatchedConditions' | 'unverifiableConditions'
>;

/** Create logs for each pullapprove group result. */
export function logGroup(
  group: PullApproveGroupResult,
  conditionsToPrint: ConditionGrouping,
  printMessageFn = Log.info,
) {
  const conditions = group[conditionsToPrint];
  printMessageFn.group(`[${group.groupName}]`);
  if (conditions.length) {
    conditions.forEach((groupCondition) => {
      const count = groupCondition.matchedFiles.size;
      if (conditionsToPrint === 'unverifiableConditions') {
        printMessageFn(`${groupCondition.expression}`);
      } else {
        printMessageFn(
          `${count} ${count === 1 ? 'match' : 'matches'} - ${groupCondition.expression}`,
        );
      }
    });
    printMessageFn.groupEnd();
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

  Log.info(`┌${fill(fillWidth, '─')}┐`);
  Log.info(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
  Log.info(`└${fill(fillWidth, '─')}┘`);
}
