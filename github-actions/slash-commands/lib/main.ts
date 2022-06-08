import * as core from '@actions/core';
import {context} from '@actions/github';
import {rerunCircleCi} from './commands/rerun-circleci.js';
import {rebase} from './commands/rebase.js';
import {getAuthTokenFor, ANGULAR_ROBOT} from '../../utils.js';
import {Octokit} from '@octokit/rest';

/** The marker used in comments to note a command is being made in the comments. */
const commandMarker = '/ng-bot';
/** RegExp for extracting command and parameters from the first line of a comment. */
const commandMatcher = new RegExp(`^${commandMarker} (.*)$`, 'm');

/** Get the parsed command from the comment. */
function parseCommandFromContext(): string[] {
  const comment: string = context.payload.comment!.body || '';
  const matches = commandMatcher.exec(comment);
  if (matches === null) {
    return [];
  }
  return matches[1]
    .split(' ')
    .map((_) => _.trim())
    .filter((_) => !!_);
}

/**
 * Determine whether the action triggers and triggering metadata means a slash command should
 * actually run.
 */
function assertProperlyFormedCommand(): boolean {
  if (context.payload.issue!.pull_request === undefined) {
    core.info('Skipping as this action was triggered from an issue not a pull request');
    return false;
  }
  if (context.eventName !== 'issue_comment') {
    core.info('Skipping as this action was not an issue_comment trigger.');
    return false;
  }
  if (!['created', 'edited'].includes(context.payload.action!)) {
    core.info('Skipping as this action was not a created or edited issue_comment trigger');
    return false;
  }
  if (!context.payload.comment!.body!.startsWith(commandMarker)) {
    core.info(`Skipping as the comment does not begin with ${commandMarker}`);
    return false;
  }
  return true;
}

/**
 * Determine whether the action triggers and triggering metadata means a slash command should
 * actually run.
 */
async function assertPermissionsToPerformCommand(): Promise<boolean> {
  if (context.payload.sender!.type === 'Bot') {
    core.info(`Skipping as this action was triggered by a bot: ${context.actor}`);
    return false;
  }
  const approvedAssociations = ['COLLABORATOR', 'MEMBER', 'OWNER'];
  if (approvedAssociations.includes(context.payload.comment!.author_association)) {
    return true;
  }
  if (context.payload.issue!.user.login === context.payload.comment!.user.login) {
    return true;
  }

  const token = await getAuthTokenFor(ANGULAR_ROBOT);
  // Create authenticated Github client.
  const github = new Octokit({auth: token});

  await github.issues.createComment({
    ...context.repo,
    issue_number: context.payload.issue!.number,
    body: `@${context.actor}, unfortunately you do not have permission to run the command you requested`,
  });

  return false;
}

/** The main function for the slash-command action. */
async function run(): Promise<void> {
  if (!assertProperlyFormedCommand() || !(await assertPermissionsToPerformCommand())) {
    return;
  }
  /** The command requested and any parameters provided to the command. */
  const [command] = parseCommandFromContext();

  switch (command) {
    case 'rerun-circleci':
      return await rerunCircleCi();
    case 'rebase':
      return await rebase();
    case undefined:
      return core.info(
        `Skipping as only the commandMarker (${commandMarker}) is provided as a command`,
      );
    default:
      core.info(`No command was run because no command matches were found for ${command}`);
  }
}

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (context.repo.owner === 'angular') {
  run();
} else {
  core.warning(
    'The action was skipped as this action is only meant to run in repos belonging to the Angular organization.',
  );
}
