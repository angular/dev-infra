import * as core from '@actions/core';

interface InputProvider {
  getInput(name: string): string;
}

// Gets a specific value from the YAML configuration.
// The value could be either a number or a string.
export const getInputValue = <T extends number | string | boolean>(
  name: string,
  _core: InputProvider = core,
): T => {
  const result = _core.getInput(name);
  if (!result) {
    throw new Error(`No value for ${name} specified in the configuration.`);
  }
  if (/^(true|false)$/.test(result)) {
    return (result === 'true' ? true : false) as T;
  }
  if (!/^-?\d+(\.?\d*)$/.test(result)) {
    return result as T;
  }
  const num = parseFloat(result);
  if (isNaN(num)) {
    throw new Error(`Can't parse ${name} as a numeric value.`);
  }
  return num as T;
};
