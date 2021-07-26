/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/index';
import {getCaretakerConfig} from '../config';

import {CiModule} from './ci';
import {G3Module} from './g3';
import {GithubQueriesModule} from './github';
import {ServicesModule} from './services';

/** List of modules checked for the caretaker check command. */
const moduleList = [
  GithubQueriesModule,
  ServicesModule,
  CiModule,
  G3Module,
];

/** Check the status of services which Angular caretakers need to monitor. */
export async function checkServiceStatuses() {
  // Set the verbose logging state of the GitClient.
  GitClient.getAuthenticatedInstance().setVerboseLoggingState(false);
  /** The configuration for the caretaker commands. */
  const config = getCaretakerConfig();
  /** List of instances of Caretaker Check modules */
  const caretakerCheckModules = moduleList.map(module => new module(config));

  // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
  // promises do not match typings, however our usage here is only to determine when the promise
  // resolves.
  await Promise.all(caretakerCheckModules.map(module => module.data as Promise<unknown>));

  for (const module of caretakerCheckModules) {
    await module.printToTerminal();
  }
}
