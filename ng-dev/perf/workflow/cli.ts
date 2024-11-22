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
import {addWorkflowPerformanceResult} from './database.js';
import {Spinner} from '../../utils/spinner.js';

interface WorkflowsParams {
  configFile: string;
  list: boolean;
  name?: string;
  commitSha?: string;
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
    })
    .option('commit-sha' as 'commitSha', {
      type: 'string',
      description: 'The commit sha to associate the measurement with, uploading it to our database',
    });
}

/** Handles the checkout pull request command. */
async function handler({configFile, list, name, commitSha}: WorkflowsParams) {
  const workflows = await loadWorkflows(join(determineRepoBaseDirFromCwd(), configFile));

  if (list) {
    process.stdout.write(JSON.stringify(Object.keys(workflows)));
    return;
  }

  const results: {name: string; value: number}[] = [];

  if (name) {
    const {value} = await measureWorkflow(workflows[name]);
    results.push({value, name});
  } else {
    for (const workflow of Object.values(workflows)) {
      const {name, value} = await measureWorkflow(workflow);
      results.push({value, name});
    }
  }

  if (commitSha) {
    const spinner = new Spinner('Uploading performance results to database');
    try {
      for (let {value, name} of results) {
        await addWorkflowPerformanceResult({
          name,
          value,
          commit_sha: commitSha,
        });
      }
    } finally {
      spinner.success('Upload complete');
    }
  }
}

/** yargs command module for checking out a PR. */
export const WorkflowsModule: CommandModule<{}, WorkflowsParams> = {
  handler,
  builder,
  command: 'workflows',
  describe: 'Evaluate the performance of the provided workflows',
};
