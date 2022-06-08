/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig} from '../../utils/config.js';
import {assertValidCaretakerConfig} from '../config.js';

import {CiModule} from './ci.js';
import {G3Module} from './g3.js';
import {GithubQueriesModule} from './github.js';
import {ServicesModule} from './services.js';

/** List of modules checked for the caretaker check command. */
const moduleList = [GithubQueriesModule, ServicesModule, CiModule, G3Module];

/** Check the status of services which Angular caretakers need to monitor. */
export async function checkServiceStatuses() {
  /** The configuration for the caretaker commands. */
  const config = getConfig();
  assertValidCaretakerConfig(config);
  assertValidGithubConfig(config);
  /** List of instances of Caretaker Check modules */
  const caretakerCheckModules = moduleList.map((module) => new module(config));

  // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
  // promises do not match typings, however our usage here is only to determine when the promise
  // resolves.
  await Promise.all(caretakerCheckModules.map((module) => module.data as Promise<unknown>));

  for (const module of caretakerCheckModules) {
    await module.printToTerminal();
  }
}
