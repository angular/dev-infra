// @ts-expect-error test subpath imports
import {subpathValue} from '#subpath_file';
// @ts-expect-error test subpath imports
import {Extractor} from '#subpath_npm';

export const a = subpathValue;
export const b = Extractor;
