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

// Exposes console utils that can be used by consumers to e.g. add messages
// to the dev-infra log which is stored on failures.
export * from './utils/console';

// Exposes Git/Github client classes needed for interacting with some of the
// release versioning APIs.
export * from './utils/git/authenticated-git-client';
export * from './utils/git/git-client';
export * from './utils/git/github';

// Additional exports for adding custom release pre-staging, post-build checks.
// TODO: Remove once https://github.com/angular/dev-infra/issues/402 is resolved.
export {ReleaseAction} from './release/publish/actions';
export {
  FatalReleaseActionError,
  UserAbortedReleaseActionError,
} from './release/publish/actions-error';
