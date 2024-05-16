/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Exposes config types, helpers for the individual commands.
export * from './utils/config.js';
export * from './commit-message/config.js';
export * from './format/config.js';
export * from './pr/config/index.js';
export * from './release/config/index.js';

// Expose all standardized labels to ease tooling relying on labels.
export * from './pr/common/labels/index.js';

// Exposes versioning utilities which are useful for building scripts with
// respect to Angular's branching/versioning and release process.
export * from './release/versioning/index.js';

// Exposes the release precheck command utilities. These should be available
// as they are needed for authoring pre-release custom checks.
export {ReleasePrecheckError} from './release/precheck/index.js';

// Expose the default Bazel workspace stamping. This might be used
// by repositories for additional custom stamping variables.
export {EnvStampMode} from './release/stamping/env-stamp.js';
export {EnvStampCustomPrintFn} from './release/stamping/cli.js';

// Exposes logging and console utils that can be used by consumers to e.g. add
// messages to the dev-infra log which is stored on failures.
export * from './utils/logging.js';

// Exposes Git/Github client classes needed for interacting with some of the
// release versioning APIs.
export * from './utils/git/authenticated-git-client.js';
export * from './utils/git/git-client.js';
export * from './utils/git/github.js';
