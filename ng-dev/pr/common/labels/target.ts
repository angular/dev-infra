import {createTypedObject, Label} from './base.js';

export class TargetLabel extends Label {
  // Field to ensure other labels are not assignable to `TargetLabel`.
  __hasTargetLabelMarker__ = true;
}

/**
 * Record capturing available target label names in the Angular organization.
 * A target label is set on a pull request to specify where its changes should land.
 *
 * More details can be found here:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU#heading=h.lkuypj38h15d
 */
export const targetLabels = createTypedObject<TargetLabel>()({
  TARGET_FEATURE: new TargetLabel({
    description: 'This PR is targeted for a feature branch (outside of main and semver branches)',
    name: 'target: feature',
  }),
  TARGET_LTS: new TargetLabel({
    description: 'This PR is targeting a version currently in long-term support',
    name: 'target: lts',
  }),
  TARGET_MAJOR: new TargetLabel({
    description: 'This PR is targeted for the next major release',
    name: 'target: major',
  }),
  TARGET_MINOR: new TargetLabel({
    description: 'This PR is targeted for the next minor release',
    name: 'target: minor',
  }),
  TARGET_PATCH: new TargetLabel({
    description: 'This PR is targeted for the next patch release',
    name: 'target: patch',
  }),
  TARGET_RC: new TargetLabel({
    description: 'This PR is targeted for the next release-candidate',
    name: 'target: rc',
  }),
});
