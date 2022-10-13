import {createTypedObject, Label} from './base.js';

interface MergeLabel extends Label {}

export const mergeLabels = createTypedObject<MergeLabel>()({
  MERGE_PRESERVE_COMMITS: {
    description: 'When the PR is merged, a rebase and merge should be performed',
    name: 'merge: preserve commits',
  },
  MERGE_SQUASH_COMMITS: {
    description: 'When the PR is merged, a squash and merge should be performed',
    name: 'merge: squash commits',
  },
  MERGE_FIX_COMMIT_MESSAGE: {
    description: 'When the PR is merged, rewrites/fixups of the commit messages are needed',
    name: 'merge: fix commit message',
  },
  MERGE_CARETAKER_NOTE: {
    description:
      'Alert the caretaker performing the merge to check the PR for an out of normal action needed or note',
    name: 'merge: caretaker note',
  },
});
