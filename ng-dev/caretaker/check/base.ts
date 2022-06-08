/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig} from '../../utils/config.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {CaretakerConfig} from '../config.js';

/** The BaseModule to extend modules for caretaker checks from. */
export abstract class BaseModule<Data> {
  /** The singleton instance of the authenticated git client. */
  protected git = AuthenticatedGitClient.get();
  /** The data for the module. */
  readonly data = this.retrieveData();

  constructor(protected config: {caretaker: CaretakerConfig; github: GithubConfig}) {}

  /** Asyncronously retrieve data for the module. */
  protected abstract retrieveData(): Promise<Data>;

  /** Print the information discovered for the module to the terminal. */
  abstract printToTerminal(): Promise<void>;
}
