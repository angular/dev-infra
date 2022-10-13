import {createTypedObject, Label} from './base.js';

interface FeatureLabel extends Label {}

export const featureLabels = createTypedObject<FeatureLabel>()({
  FEATURE_IN_BACKLOG: {
    name: 'feature: in backlog',
    description: 'Feature request for which voting has completed and is now in the backlog',
  },
  FEATURE_VOTES_REQUIRED: {
    name: 'feature: votes required',
    description: 'Feature request which is currently still in the voting phase',
  },
  FEATURE_UNDER_CONSIDERATION: {
    name: 'feature: under consideration',
    description:
      'Feature request for which voting has completed and the request is now under consideration',
  },
  FEATURE_INSUFFICIENT_VOTES: {
    name: 'feature: insufficient votes',
    description:
      'Label to add when the not a sufficient number of votes or comments from unique authors',
  },
});
