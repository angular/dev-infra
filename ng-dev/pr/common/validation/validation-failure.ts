/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestValidationConfig} from '../../config/index.js';

/** Class that can be used to describe pull request validation failures. */
export class PullRequestValidationFailure {
  constructor(
    /** Human-readable message for the failure */
    public readonly message: string,
    /** Validation config name for the failure. */
    public readonly validationName: keyof PullRequestValidationConfig,
    /** Validation config name for the failure. */
    public readonly canBeForceIgnored: boolean,
  ) {}
}
