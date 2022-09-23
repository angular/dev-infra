import {createTypedObject, Label} from './base.js';

interface ActionLabel extends Label {}

export const actionLabels = createTypedObject<ActionLabel>()({
  ACTION_MERGE: {
    description: 'The PR is ready for merge by the caretaker',
    label: 'action: merge',
  },
  ACTION_CLEANUP: {
    description:
      'The PR is in need of cleanup, either due to needing a rebase or in response to comments from a review.',
    label: 'action: cleanup',
  },
  ACTION_PRESUBMIT: {
    description: 'The PR is in need of a google3 presubmit',
    label: 'action: presubmit',
  },
  ACTION_REVIEW: {
    description: 'The PR is still awaiting reviews from at least one requested reviewer',
    label: 'action: review',
  },
});
