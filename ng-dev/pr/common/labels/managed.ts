import {Commit} from '../../../commit-message/parse.js';
import {createTypedObject, Label, LabelParams, ManagedRepositories} from './base.js';

export interface ManageLabelParams extends LabelParams {
  /** A matching function, if the label is automatically applied by our github action, otherwise false. */
  commitCheck: (c: Commit) => boolean;
}

class ManagedLabel extends Label<ManageLabelParams> {
  /** A matching function, if the label is automatically applied by our github action, otherwise false. */
  commitCheck: (c: Commit) => boolean = this.params.commitCheck;
}

export const managedLabels = createTypedObject(ManagedLabel)({
  DETECTED_BREAKING_CHANGE: {
    description: 'PR contains a commit with a breaking change',
    name: 'detected: breaking change',
    commitCheck: (c: Commit) => c.breakingChanges.length !== 0,
  },
  DETECTED_DEPRECATION: {
    description: 'PR contains a commit with a deprecation',
    name: 'detected: deprecation',
    commitCheck: (c: Commit) => c.deprecations.length !== 0,
  },
  DETECTED_FEATURE: {
    description: 'PR contains a feature commit',
    name: 'detected: feature',
    commitCheck: (c: Commit) => c.type === 'feat',
  },
  DETECTED_DOCS_CHANGE: {
    description: 'Related to the documentation',
    name: 'area: docs',
    commitCheck: (c: Commit) => c.type === 'docs',
  },
  DETECTED_INFRA_CHANGE: {
    description: 'Related the build and CI infrastructure of the project',
    name: 'area: build & ci',
    commitCheck: (c: Commit) => c.type === 'build' || c.type === 'ci',
  },
  DETECTED_PERF_CHANGE: {
    description: 'Issues related to performance',
    name: 'area: performance',
    commitCheck: (c: Commit) => c.type === 'perf',
  },

  // angular/angular specific labels.
  DETECTED_HTTP_CHANGE: {
    description: 'Issues related to HTTP and HTTP Client',
    name: 'area: common/http',
    commitCheck: (c: Commit) => c.type === 'common/http' || c.type === 'http',
    repositories: [ManagedRepositories.ANGULAR],
  },
  DETECTED_COMPILER_CHANGE: {
    description: "Issues related to `ngc`, Angular's template compiler",
    name: 'area: compiler',
    commitCheck: (c: Commit) => c.type === 'compiler' || c.type === 'compiler-cli',
    repositories: [ManagedRepositories.ANGULAR],
  },
  DETECTED_PLATFORM_BROWSER_CHANGE: {
    description: 'Issues related to the framework runtime',
    name: 'area: core',
    commitCheck: (c: Commit) => c.type === 'platform-browser' || c.type === 'core',
    repositories: [ManagedRepositories.ANGULAR],
  },
});
