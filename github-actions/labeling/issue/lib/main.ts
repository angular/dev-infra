import * as core from '@actions/core';
import {context} from '@actions/github';
import {IssueLabeling} from './issue-labeling.js';

// Only run if the action is executed in a repository within the Angular org.
if (context.repo.owner === 'angular') {
  IssueLabeling.run().catch((e: Error) => {
    console.error(e);
    core.setFailed(e.message);
  });
} else {
  core.warning(
    'Automatic labeling was skipped as this action is only meant to run ' +
      'in repos belonging to the Angular organization.',
  );
}
