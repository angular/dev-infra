import {managedLabels} from './labels/managed.js';
import {actionLabels} from './labels/action.js';
import {mergeLabels} from './labels/merge.js';
import {targetLabels} from './labels/target.js';
import {priorityLabels} from './labels/priority.js';
import {featureLabels} from './labels/feature.js';

export const allLabels = {
  ...managedLabels,
  ...actionLabels,
  ...mergeLabels,
  ...targetLabels,
  ...priorityLabels,
  ...featureLabels,
};

export {managedLabels, actionLabels, mergeLabels, targetLabels, priorityLabels};
