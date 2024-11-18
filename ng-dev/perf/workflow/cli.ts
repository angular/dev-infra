/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv, CommandModule} from 'yargs';
import {measureWorkflow} from './workflow.js';
import {loadWorkflows} from './loader.js';
import {join} from 'path';
import {determineRepoBaseDirFromCwd} from '../../utils/repo-directory.js';

interface WorkflowsParams {
  configFile: string;
  list: boolean;
  name?: string;
}

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return yargs
    .option('config-file' as 'configFile', {
      default: '.ng-dev/dx-perf-workflows.yml',
      type: 'string',
      description: 'The path to the workflow definitions in a yml file',
    })
    .option('list', {
      default: false,
      type: 'boolean',
      description: 'Whether to get back a list of workflows that can be executed',
    })
    .option('name', {
      type: 'string',
      description: 'A specific workflow to run by name',
    });
}

/** Handles the checkout pull request command. */
async function handler({configFile, list, name}: WorkflowsParams) {
  const workflows = await loadWorkflows(join(determineRepoBaseDirFromCwd(), configFile));

  if (list) {
    process.stdout.write(JSON.stringify(Object.keys(workflows)));
    return;
  }

  if (name) {
    const {duration} = await measureWorkflow(workflows[name]);
    process.stdout.write(JSON.stringify({[name]: duration}));
    return;
  }

  const results: {[key: string]: number} = {};
  for (const workflow of Object.values(workflows)) {
    const {name, duration} = await measureWorkflow(workflow);
    results[name] = duration;
  }
  process.stdout.write(JSON.stringify(results));
}

/** yargs command module for checking out a PR. */
export const WorkflowsModule: CommandModule<{}, WorkflowsParams> = {
  handler,
  builder,
  command: 'workflows',
  describe: 'Evaluate the performance of the provided workflows',
};
