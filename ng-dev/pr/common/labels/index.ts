import {managedLabels} from './managed.js';
import {actionLabels} from './action.js';
import {mergeLabels} from './merge.js';
import {targetLabels} from './target.js';
import {priorityLabels} from './priority.js';
import {featureLabels} from './feature.js';
import {Label} from './base.js';

export const allLabels = {
  ...managedLabels,
  ...actionLabels,
  ...mergeLabels,
  ...targetLabels,
  ...priorityLabels,
  ...featureLabels,
};

// Ensures that all labels in `allLabels` properly implement `Label`.
const _typeCheckEnforceAllLabels: Record<PropertyKey, Label> = allLabels;

export {managedLabels, actionLabels, mergeLabels, targetLabels, priorityLabels};
export {Label};
