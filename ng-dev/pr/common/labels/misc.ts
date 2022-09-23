import {createTypedObject, Label} from './base.js';

interface MiscLabel extends Label {}

export const miscLabels = createTypedObject<MiscLabel>()({
  FEATURE: {
    label: 'feature',
    description: 'Label used to distinguish feature request from other issues',
  },
  GOOD_FIRST_ISSUE: {
    label: 'good first issue',
    description: 'Label noting a good first issue to be worked on by a community member',
  },
  HELP_WANTED: {
    label: 'help wanted',
    description:
      'Label noting an issue which the team is looking for contribution from the community to fix',
  },
});
