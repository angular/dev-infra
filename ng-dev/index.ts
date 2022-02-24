/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Exposes config types, helpers for the individual commands.
export * from './utils/config';
export * from './caretaker/config';
export * from './commit-message/config';
export * from './format/config';
export * from './pr/config';
export * from './release/config';

// Exposes versioning utilities which are useful for building scripts with
// respect to Angular's branching/versioning and release process.
export * from './release/versioning';

// Additional exports for adding custom release pre-staging, post-build checks.
// TODO: Remove this once we have a public API for release hooks/checks
export {ReleaseAction} from './release/publish/actions';
export {
  FatalReleaseActionError,
  UserAbortedReleaseActionError,
} from './release/publish/actions-error';
