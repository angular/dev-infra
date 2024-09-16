import {createTypedObject, Label} from './base.js';

class NeedsLabel extends Label {}

export const needsLabels = createTypedObject(NeedsLabel)({
  NEEDS_CLARIFICATION: {
    name: 'needs: clarification',
    description:
      'The issue needs a reproduction or clarification to be fully understood and assessed',
  },
  NEEDS_VERIFICATION: {
    name: 'needs: verification',
    description:
      'The issue still requires investigation or verification, but is waiting on the Angular team to perform the action',
  },
  NEEDS_DISCUSSION: {
    name: 'needs: discussion',
    description:
      'The issue or PR is understood, but requires more discussion before the next step can occur',
  },
});
