/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  PullApproveAuthorStateDependencyError,
  PullApproveGroupStateDependencyError,
} from './condition_errors.js';

import {PullApproveGroupConfig} from './parse-yaml.js';
import {convertConditionToFunction} from './condition_evaluator.js';
import {Log} from '../utils/logging.js';

/** A condition for a group. */
interface GroupCondition {
  expression: string;
  checkFn: (files: string[], groups: PullApproveGroup[]) => boolean;
  matchedFiles: Set<string>;
  unverifiable: boolean;
}

interface GroupReviewers {
  users?: string[];
  teams?: string[];
}

/** Result of testing files against the group. */
export interface PullApproveGroupResult {
  groupName: string;
  matchedConditions: GroupCondition[];
  matchedCount: number;
  unmatchedConditions: GroupCondition[];
  unmatchedCount: number;
  unverifiableConditions: GroupCondition[];
}

/** A PullApprove group to be able to test files against. */
export class PullApproveGroup {
  /** List of conditions for the group. */
  readonly conditions: GroupCondition[] = [];
  /** List of reviewers for the group. */
  readonly reviewers: GroupReviewers;

  constructor(
    public groupName: string,
    config: PullApproveGroupConfig,
    readonly precedingGroups: PullApproveGroup[] = [],
  ) {
    this._captureConditions(config);
    this.reviewers = config.reviewers ?? {users: [], teams: []};
  }

  private _captureConditions(config: PullApproveGroupConfig) {
    if (config.conditions) {
      return config.conditions.forEach((condition) => {
        const expression = condition.trim();

        try {
          this.conditions.push({
            expression,
            checkFn: convertConditionToFunction(expression),
            matchedFiles: new Set(),
            unverifiable: false,
          });
        } catch (e) {
          Log.error(`Could not parse condition in group: ${this.groupName}`);
          Log.error(` - ${expression}`);
          Log.error(`Error:`, e);
          process.exit(1);
        }
      });
    }
  }

  /**
   * Tests a provided file path to determine if it would be considered matched by
   * the pull approve group's conditions.
   */
  testFile(filePath: string): boolean {
    let allConditionsMet: boolean | null = null;

    for (const condition of this.conditions) {
      const {matchedFiles, checkFn, expression} = condition;
      try {
        const matchesFile = checkFn([filePath], this.precedingGroups);

        if (matchesFile) {
          matchedFiles.add(filePath);
        }

        allConditionsMet = (allConditionsMet ?? true) && matchesFile;
      } catch (e) {
        // If a group relies on the author state, we assume this group to never match
        // or own a file. This is a strict assumption but prevents false-positives.
        if (e instanceof PullApproveAuthorStateDependencyError) {
          condition.unverifiable = true;
          allConditionsMet = false;
        }
        // In the case of a condition that depends on the state of groups, we want to ignore
        // that the verification can't accurately evaluate the condition and continue processing.
        // Other types of errors fail the verification, as conditions should otherwise be able to
        // execute without throwing.
        else if (e instanceof PullApproveGroupStateDependencyError) {
          condition.unverifiable = true;
        } else {
          const errMessage =
            `Condition could not be evaluated: \n\n` +
            `From the [${this.groupName}] group:\n` +
            ` - ${expression}`;
          Log.error(errMessage, '\n\n', e, '\n\n');
          process.exit(1);
        }
      }
    }

    // A file matches the group when all conditions are met. A group is not considered
    // as matching when all conditions have been skipped.
    return allConditionsMet === true;
  }

  /** Retrieve the results for the Group, all matched and unmatched conditions. */
  getResults(): PullApproveGroupResult {
    const matchedConditions = this.conditions.filter((c) => c.matchedFiles.size > 0);
    const unmatchedConditions = this.conditions.filter(
      (c) => c.matchedFiles.size === 0 && !c.unverifiable,
    );
    const unverifiableConditions = this.conditions.filter((c) => c.unverifiable);
    return {
      matchedConditions,
      matchedCount: matchedConditions.length,
      unmatchedConditions,
      unmatchedCount: unmatchedConditions.length,
      unverifiableConditions,
      groupName: this.groupName,
    };
  }
}
