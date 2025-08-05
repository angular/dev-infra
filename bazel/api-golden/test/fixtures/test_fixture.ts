import {rawStringFn, testValue} from './transitive_target';

import * as babel from '@babel/core';

export {testValue, rawStringFn};

export type MyBabelExport = babel.BabelFile;

export class SomeOtherExport {}
export class ɵShouldBeIgnored {}
