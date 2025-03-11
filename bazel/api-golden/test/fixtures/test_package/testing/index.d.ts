import {fromTopLevel} from 'test-package';

export {sharedChunk} from '.././shared_chunk.js';

export declare const anotherVariable = fromTopLevel;

export declare function rawStringFn(input: string): string;
