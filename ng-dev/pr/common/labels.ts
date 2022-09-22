import {Commit} from '../../commit-message/parse.js';

interface Label {
  /* The label string. */
  label: string;
  /** A matching function, if the label is automatically applied by our github action, otherwise false. */
  commitCheck: ((c: Commit) => boolean) | false;
}

/** Set of labels which are known to tooling, and in some cases are managed by tooling. */
export const ToolingPullRequestLabels = {
  BREAKING_CHANGE: <Label>{
    label: 'flag: breaking change',
    commitCheck: (c: Commit) => c.breakingChanges.length !== 0,
  },
  DEPRECATION: <Label>{
    label: 'flag: deprecation',
    commitCheck: (c: Commit) => c.deprecations.length !== 0,
  },
  FEATURE: <Label>{
    label: 'feature',
    commitCheck: (c: Commit) => c.type === 'feat',
  },
  DOCS_CHANGE: <Label>{
    label: 'comp: docs',
    commitCheck: (c: Commit) => c.type === 'docs',
  },
};
