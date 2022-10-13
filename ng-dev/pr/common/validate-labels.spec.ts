import {allLabels} from './labels.js';

describe('All labels:', () => {
  for (const {label, description} of Object.values(allLabels)) {
    it(`description for "${label}" is less than or equal to 100 characters`, () => {
      expect(description.length).toBeLessThanOrEqual(100);
    });
  }
});
