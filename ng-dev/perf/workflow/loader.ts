import {readFile} from 'fs/promises';
import {parse} from 'yaml';

export interface Workflow {
  // The friendly name of the workflow.
  name: string;
  // The set of commands to run under timing test for the workflow.
  workflow: string[];
  // The set of commands to run in preparation for the workflow.
  prepare?: string[];
  // The set of commands to run as a cleanup.
  cleanup?: string[];
  // Whether the workflow is temporarily disabled.
  disabled?: true;
}

export async function loadWorkflows(src: string) {
  /** The set of workflows which can be executed. */
  const filteredWorkflows: {[key: string]: Workflow} = {};
  /** The workflow configuration file content as a string.  */
  const rawWorkflows = await readFile(src, {encoding: 'utf-8'});
  /** The object parsed from the workflow configuration file, holding the workflow configurations. */
  const workflows = parse(rawWorkflows).workflows as {[key: string]: Workflow};

  // Remove any workflow which is marked as disabled.
  for (const [name, workflow] of Object.entries(workflows)) {
    if (workflow.disabled !== true) {
      filteredWorkflows[name] = workflow;
    }
  }

  return filteredWorkflows;
}
