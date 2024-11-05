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
  json: boolean;
}

/** Builds the checkout pull request command. */
function builder(yargs: Argv) {
  return yargs
    .option('config-file' as 'configFile', {
      default: '.ng-dev/workflows.yml',
      type: 'string',
      description: 'The path to the workflow definitions in a yml file',
    })
    .option('json', {
      default: false,
      type: 'boolean',
      description: 'Whether to ouput the results as a json object',
    });
}

/** Handles the checkout pull request command. */
async function handler({configFile, json}: WorkflowsParams) {
  const workflows = await loadWorkflows(join(determineRepoBaseDirFromCwd(), configFile));
  const results: {[key: string]: number} = {};
  for (const workflow of workflows) {
    const {name, duration} = await measureWorkflow(workflow);
    results[name] = duration;
  }

  if (json) {
    process.stdout.write(JSON.stringify(results));
  }
}

/** yargs command module for checking out a PR  */
export const WorkflowsModule: CommandModule<{}, WorkflowsParams> = {
  handler,
  builder,
  command: 'workflows',
  describe: 'Evaluate the performance of the provided workflows',
};
