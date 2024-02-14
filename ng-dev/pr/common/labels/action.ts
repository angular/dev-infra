import {createTypedObject, Label} from './base.js';

interface ActionLabel extends Label {}

export const actionLabels = createTypedObject<ActionLabel>()({
  ACTION_MERGE: {
    description: 'The PR is ready for merge by the caretaker',
    name: 'action: merge',
  },
  ACTION_CLEANUP: {
    description:
      'The PR is in need of cleanup, either due to needing a rebase or in response to comments from reviews',
    name: 'action: cleanup',
  },
  ACTION_PRESUBMIT: {
    description: 'The PR is in need of a google3 presubmit',
    name: 'action: presubmit',
  },
  ACTION_GLOBAL_PRESUBMIT: {
    description: 'The PR is in need of a google3 global presubmit',
    name: 'action: global presubmit',
  },
  ACTION_REVIEW: {
    description: 'The PR is still awaiting reviews from at least one requested reviewer',
    name: 'action: review',
  },
});
