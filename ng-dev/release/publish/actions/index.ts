/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReleaseActionConstructor} from '../actions.js';

import {CutLongTermSupportPatchAction} from './cut-lts-patch.js';
import {CutNewPatchAction} from './cut-new-patch.js';
import {CutNpmNextPrereleaseAction} from './cut-npm-next-prerelease.js';
import {CutNpmNextReleaseCandidateAction} from './cut-npm-next-release-candidate.js';
import {CutStableAction} from './cut-stable.js';
import {CutExceptionalMinorPrereleaseAction} from './exceptional-minor/cut-exceptional-minor-prerelease.js';
import {CutExceptionalMinorReleaseCandidateAction} from './exceptional-minor/cut-exceptional-minor-release-candidate.js';
import {PrepareExceptionalMinorAction} from './exceptional-minor/prepare-exceptional-minor.js';
import {MoveNextIntoFeatureFreezeAction} from './move-next-into-feature-freeze.js';
import {MoveNextIntoReleaseCandidateAction} from './move-next-into-release-candidate.js';
import {TagRecentMajorAsLatest} from './tag-recent-major-as-latest.js';

/**
 * List of release actions supported by the release staging tool. These are sorted
 * by priority. Actions which are selectable are sorted based on this declaration order.
 */
export const actions: ReleaseActionConstructor[] = [
  CutExceptionalMinorReleaseCandidateAction,
  CutExceptionalMinorPrereleaseAction,
  TagRecentMajorAsLatest,
  CutStableAction,
  CutNpmNextReleaseCandidateAction,
  CutNewPatchAction,
  CutNpmNextPrereleaseAction,
  MoveNextIntoFeatureFreezeAction,
  MoveNextIntoReleaseCandidateAction,
  PrepareExceptionalMinorAction,
  CutLongTermSupportPatchAction,
];
