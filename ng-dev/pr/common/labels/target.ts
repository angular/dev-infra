import {createTypedObject, Label} from './base.js';

interface TargetLabel extends Label {}

export const targetLabels = createTypedObject<TargetLabel>()({
  TARGET_FEATURE: {
    description: 'This PR is targeted for a feature branch (outside of main and semver branches)',
    name: 'target: feature',
  },
  TARGET_LTS: {
    description: 'This PR is targeting a version currently in long-term support',
    name: 'target: lts',
  },
  TARGET_MAJOR: {
    description: 'This PR is targeted for the next major release',
    name: 'target: major',
  },
  TARGET_MINOR: {
    description: 'This PR is targeted for the next minor release',
    name: 'target: minor',
  },
  TARGET_PATCH: {
    description: 'This PR is targeted for the next patch release',
    name: 'target: patch',
  },
  TARGET_RC: {
    description: 'This PR is targeted for the next release-candidate',
    name: 'target: rc',
  },
});
