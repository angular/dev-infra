import * as core from '@actions/core';
import {context} from '@actions/github';
import {postApprovalChangesMain} from './post-approval-changes.js';

// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
// Runs triggered via 'workflow_dispatch' are also allowed to run.
if (context.repo.owner === 'angular') {
  postApprovalChangesMain().catch((e: Error) => {
    console.error(e);
    console.error(e.stack);
    core.setFailed(e.message);
  });
} else {
  core.warning(
    'Post Approvals changes check was skipped as this action is only meant to run in repos ' +
      'belonging to the Angular organization.',
  );
}
