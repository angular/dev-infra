import {createTypedObject, Label} from './base.js';

interface FeatureLabel extends Label {}

export const featureLabels = createTypedObject<FeatureLabel>()({
  FEATURE_IN_BACKLOG: {
    label: 'feature: in backlog',
    description:
      'Label used to distinguish feature requests, which are already part of the backlog',
  },
  FEATURE_VOTES_REQUIRED: {
    label: 'feature: votes required',
    description: 'Label used to distinguish requests in voting phase from other issues',
  },
  FEATURE_UNDER_CONSIDERATION: {
    label: 'feature: under consideration',
    description: 'Label used to distinguish features which are in our list for consideration',
  },
  FEATURE_INSUFFICIENT_VOTES: {
    label: 'feature: insufficient votes',
    description:
      'Label to add when the `close-when-no-sufficient-votes` is set to false and there are no sufficient number of votes or comments from unique authors',
  },
});
