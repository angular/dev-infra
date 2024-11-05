import {ChildProcess} from '../../utils/child-process.js';
import {green} from '../../utils/logging.js';
import {Spinner} from '../../utils/spinner.js';
import {Workflow} from './loader.js';

export async function measureWorkflow({name, workflow, prepare, cleanup}: Workflow) {
  const spinner = new Spinner('');
  try {
    if (prepare) {
      spinner.update('Preparing environment for workflow execution');
      // Run the `prepare` commands to establish the environment, caching, etc prior to running the
      // workflow.
      await runCommands(prepare);
      spinner.update('Environment preperation completed');
    }

    spinner.update(`Executing workflow (${name})`);
    // Mark the start time of the workflow, execute all of the commands provided in the workflow and
    // then mark the ending time.
    performance.mark('start');
    await runCommands(workflow);
    performance.mark('end');

    spinner.update('Workflow completed');

    if (cleanup) {
      spinner.update('Cleaning up environment after workflow');
      // Run the clean up commands to reset the environment and undo changes made during the workflow.
      await runCommands(cleanup);
      spinner.update('Environment cleanup complete');
    }

    const results = performance.measure(name, 'start', 'end');

    spinner.complete(` ${green('✓')} ${name}: ${results.duration.toFixed(2)}ms`);

    return results.toJSON();
  } finally {
    spinner.complete();
  }
}

/**
 * Run a set of commands provided as a multiline text block. Commands are assumed to always be
 * provided on a single line.
 */
async function runCommands(cmds?: string) {
  cmds = cmds?.trim();
  if (!cmds) {
    return;
  }
  let commands = cmds
    .split('\n')
    .filter((_) => !!_)
    .map((cmdStr: string) => cmdStr.trim().split(' '));

  for (let [cmd, ...args] of commands) {
    await ChildProcess.spawn(cmd, args, {mode: 'silent'});
  }
}
