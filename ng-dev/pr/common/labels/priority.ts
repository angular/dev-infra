import {createTypedObject, Label} from './base.js';

interface PriorityLabel extends Label {}

export const priorityLabels = createTypedObject<PriorityLabel>()({
  P0: {
    name: 'P0',
    description:
      'Issue that causes an outage, breakage, or major function to be unusable, with no known workarounds',
  },
  P1: {
    name: 'P1',
    description:
      'Impacts a large percentage of users; if a workaround exists it is partial or overly painful',
  },
  P2: {
    name: 'P2',
    description: 'The issue is important to a large percentage of users, with a workaround',
  },
  P3: {
    name: 'P3',
    description:
      'An issue that is relevant to core functions, but does not impede progress. Important, but not urgent',
  },
  P4: {
    name: 'P4',
    description: 'A relatively minor issue that is not relevant to core functions',
  },
  P5: {
    name: 'P5',
    description:
      'The team acknowledges the request but does not plan to address it, it remains open for discussion',
  },
});
