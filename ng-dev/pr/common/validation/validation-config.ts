/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestValidationConfig} from '../../config/index.js';
import {PullRequestValidationFailure} from './validation-failure.js';

/**
 * Pull request validation configuration controlling which assertions
 * should run or not. This enables the forcibly non-fatal ignore feature.
 */
const defaultConfig: PullRequestValidationConfig = {
  assertPending: true,
  assertMergeReady: true,
  assertSignedCla: true,
  assertChangesAllowForTargetLabel: true,
  assertPassingCi: true,
  assertCompletedReviews: true,
  assertEnforcedStatuses: true,
  assertMinimumReviews: true,
  assertIsolatedSeparateFiles: false,
  assertEnforceTested: false,
};

export function createPullRequestValidationConfig(
  config: PullRequestValidationConfig,
): PullRequestValidationConfig {
  return {...defaultConfig, ...config};
}

/** Type describing a helper function for validations to create a validation failure. */
export type PullRequestValidationErrorCreateFn = (message: string) => PullRequestValidationFailure;

/**
 * Base class for pull request validations, providing helpers for the validation errors,
 * and a consistent interface for checking the activation state of validations
 */
export abstract class PullRequestValidation {
  constructor(
    protected name: keyof PullRequestValidationConfig,
    protected _createError: PullRequestValidationErrorCreateFn,
  ) {}

  /** Assertion function to be defined for the specific validator. */
  abstract assert(...parameters: unknown[]): void | Promise<void>;
}

/** Creates a pull request validation from a configuration and implementation class. */
export function createPullRequestValidation<T extends PullRequestValidation>(
  {name, canBeForceIgnored}: {name: keyof PullRequestValidationConfig; canBeForceIgnored: boolean},
  getValidationCtor: () => new (...args: ConstructorParameters<typeof PullRequestValidation>) => T,
) {
  return {
    async run(
      validationConfig: PullRequestValidationConfig,
      ...args: Parameters<T['assert']>
    ): Promise<PullRequestValidationFailure | null> {
      if (validationConfig[name]) {
        const validation = new (getValidationCtor())(
          name,
          (message) => new PullRequestValidationFailure(message, name, canBeForceIgnored),
        );
        try {
          await validation.assert(...args);
        } catch (e) {
          if (e instanceof PullRequestValidationFailure) {
            return e;
          }
          throw e;
        }
      }
      return null;
    },
  };
}
