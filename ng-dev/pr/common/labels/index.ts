import {managedLabels} from './managed.js';
import {actionLabels} from './action.js';
import {mergeLabels} from './merge.js';
import {targetLabels} from './target.js';
import {priorityLabels} from './priority.js';
import {featureLabels} from './feature.js';
import {requiresLabels} from './requires.js';
import {Label, LabelParams} from './base.js';
import {miscLabels} from './misc.js';

export const allLabels = {
  ...managedLabels,
  ...actionLabels,
  ...mergeLabels,
  ...targetLabels,
  ...priorityLabels,
  ...featureLabels,
  ...requiresLabels,
  ...miscLabels,
};

// Ensures that all labels in `allLabels` properly implement `Label`.
const _typeCheckEnforceAllLabels: Record<PropertyKey, Label<LabelParams>> = allLabels;

export {
  managedLabels,
  actionLabels,
  mergeLabels,
  targetLabels,
  priorityLabels,
  requiresLabels,
  miscLabels,
};
export {Label};
