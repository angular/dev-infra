import {createTypedObject, Label} from './base.js';

interface PriorityLabel extends Label {}

export const priorityLabels = createTypedObject<PriorityLabel>()({
  P0: {
    label: 'P0',
    description:
      'An issue that causes a full outage, breakage, or major function unavailability for everyone, without any known workaround. The issue must be fixed immediately, taking precedence over all other work. Should receive updates at least once per day.',
  },
  P1: {
    label: 'P1',
    description:
      'An issue that significantly impacts a large percentage of users; if there is a workaround it is partial or overly painful. The issue should be resolved before the next release.',
  },
  P2: {
    label: 'P2',
    description:
      'The issue is important to a large percentage of users, with a workaround. Issues that are significantly ugly or painful (especially first-use or install-time issues). Issues with workarounds that would otherwise be P0 or P1.',
  },
  P3: {
    label: 'P3',
    description:
      'An issue that is relevant to core functions, but does not impede progress. Important, but not urgent.',
  },
  P4: {
    label: 'P4',
    description:
      'A relatively minor issue that is not relevant to core functions, or relates only to the attractiveness or pleasantness of use of the system. Good to have but not necessary changes/fixes.',
  },
  P5: {
    label: 'P5',
    description:
      'The team acknowledges the request but (due to any number of reasons) does not plan to work on or accept contributions for this request. The issue remains open for discussion.',
  },
});
