/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {yellow, Log} from '../../../utils/logging.js';
import {Prompt} from '../../../utils/prompt.js';
import {PullRequestValidationFailure} from './validation-failure.js';

/**
 * Pull request validation configuration controlling which assertions
 * should run or not. This enables the forcibly non-fatal ignore feature.
 */
export class PullRequestValidationConfig {
  assertPending = true;
  assertMergeReady = true;
  assertSignedCla = true;
  assertChangesAllowForTargetLabel = true;
  assertPassingCi = true;
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
}

/** Creates a pull request validation from a configuration and implementation class. */
export function createPullRequestValidation<T extends PullRequestValidation>(
  {name, canBeForceIgnored}: {name: keyof PullRequestValidationConfig; canBeForceIgnored: boolean},
  getValidationCtor: () => new (...args: ConstructorParameters<typeof PullRequestValidation>) => T,
) {
  return {
    async run(validationConfig: PullRequestValidationConfig, fn: (v: T) => void): Promise<void> {
      if (validationConfig[name]) {
        const validation = new (getValidationCtor())(
          name,
          (message) => new PullRequestValidationFailure(message, name),
        );

        try {
          fn(validation);
        } catch (e) {
          if (e instanceof PullRequestValidationFailure && canBeForceIgnored) {
            Log.error(`Pull request did not pass validation check.`);
            Log.error(e.message);
            Log.info();
            Log.info(yellow(`This validation is non-fatal and can be forcibly ignored.`));

            if (await Prompt.confirm('Do you want to forcibly ignore this validation?')) {
              return;
            }
          }

          throw e;
        }
      }
    },
  };
}
