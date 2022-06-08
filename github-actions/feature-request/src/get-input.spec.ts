import {getInputValue} from './get-input.js';

describe('getInputValue', () => {
  it('should parse strings', () => {
    const result = getInputValue('foo', {
      getInput() {
        return 'a';
      },
    });
    expect(result).toBe('a');
  });

  it('should parse boolean values', () => {
    const trueResult = getInputValue('foo', {
      getInput() {
        return 'true';
      },
    });
    expect(trueResult).toBe(true);

    const falseResult = getInputValue('foo', {
      getInput() {
        return 'false';
      },
    });
    expect(falseResult).toBe(false);
  });

  it('should parse numbers', () => {
    const negative = getInputValue('foo', {
      getInput() {
        return '-1';
      },
    });
    expect(negative).toBe(-1);

    const positive = getInputValue('foo', {
      getInput() {
        return '42';
      },
    });
    expect(positive).toBe(42);

    const decimal = getInputValue('foo', {
      getInput() {
        return '42.42';
      },
    });
    expect(decimal).toBe(42.42);

    const decimalNegative = getInputValue('foo', {
      getInput() {
        return '-42.42';
      },
    });
    expect(decimalNegative).toBe(-42.42);
  });
});
