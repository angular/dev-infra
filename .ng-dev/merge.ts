import {MergeConfig} from '../ng-dev/pr/merge/config';

/** Configuration for merging pull requests into the repo. */
export const merge: MergeConfig = {
  githubApiMerge: false,
  claSignedLabel: 'cla: yes',
  mergeReadyLabel: 'action: merge',
  caretakerNoteLabel: 'merge note',
  commitMessageFixupLabel: 'needs commit fixup',
  noTargetLabeling: true,
};
