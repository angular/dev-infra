import {createTypedObject, Label} from './base.js';

interface RequiresLabel extends Label {}

export const requiresLabels = createTypedObject<RequiresLabel>()({
  REQUIRES_TGP: {
    name: 'requires: TGP',
    description: 'This PR requires a passing TGP before merging is allowed',
  },
});
