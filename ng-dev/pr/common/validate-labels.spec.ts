import {allLabels, Label} from './labels.js';

describe('All labels:', () => {
  for (const {description, name, color} of Object.values<Label>(allLabels)) {
    it(`description for "${name}" is less than or equal to 100 characters`, () => {
      expect(description.length).toBeLessThanOrEqual(100);
    });

    it(`color for "${name}", if it exists, is a 6 digit hexadecimal color code`, () => {
      if (color === undefined) {
        // If the color is not defined, then we don't need to confirm its a valid color code.
        return;
      }
      expect(color.length).toBe(6);
      expect(parseInt(color, 16)).not.toBeNaN();
    });
  }
});
