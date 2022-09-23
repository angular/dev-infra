import {createTypedObject, Label} from './base.js';

interface TargetLabel extends Label {}

export const targetLabels = createTypedObject<TargetLabel>()({
  TARGET_FEATURE: {
    description: 'This PR is targeted for a feature branch (outside of main and semver branches)',
    label: 'target: feature',
  },
  TARGET_LTS: {
    description: 'This PR is targeting a version currently in long-term support',
    label: 'target: lts',
  },
  TARGET_MAJOR: {
    description: 'This PR is targeted for the next major release',
    label: 'target: major',
  },
  TARGET_MINOR: {
    description: 'This PR is targeted for the next minor release',
    label: 'target: minor',
  },
  TARGET_PATCH: {
    description: 'This PR is targeted for the next patch release',
    label: 'target: patch',
  },
  TARGET_RC: {
    description: 'This PR is targeted for the next release-candidate',
    label: 'target: rc',
  },
});
