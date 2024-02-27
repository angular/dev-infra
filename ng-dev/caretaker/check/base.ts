/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig, CaretakerConfig} from '../../utils/config.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';

/** The BaseModule to extend modules for caretaker checks from. */
export abstract class BaseModule<Data> {
  /** The data for the module. */
  readonly data = this.retrieveData();

  constructor(
    protected git: AuthenticatedGitClient,
    protected config: {caretaker: CaretakerConfig; github: GithubConfig},
  ) {}

  /** Asynchronously retrieve data for the module. */
  protected abstract retrieveData(): Promise<Data>;

  /** Print the information discovered for the module to the terminal. */
  abstract printToTerminal(): Promise<void>;
}
