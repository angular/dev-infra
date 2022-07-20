/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PullRequestValidationConfig} from './validation-config.js';

/** Class that can be used to describe pull request validation failures. */
export class PullRequestValidationFailure {
  constructor(
    /** Human-readable message for the failure */
    public message: string,
    /** Validation config name for the failure. */
    public validationName: keyof PullRequestValidationConfig,
  ) {}
}
