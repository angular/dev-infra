import {DevInfraMergeConfig} from '../ng-dev/pr/merge/config';

/** Configuration for merging pull requests into the repo. */
export const merge: DevInfraMergeConfig['merge'] = async (api) => {
  return {
    githubApiMerge: false,
    claSignedLabel: 'cla: yes',
    mergeReadyLabel: 'action: merge',
    caretakerNoteLabel: 'merge note',
    commitMessageFixupLabel: 'needs commit fixup',
    labels: [
      {
        // Since only one branch is merged into for the repository, all patterns are matching.
        pattern: /.*/,
        branches: ['master'],
      },
    ],
  };
};
