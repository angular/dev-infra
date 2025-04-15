export {commonValue} from './common_extension.cjs';

// This file compiles to CommonJS, so it needs a dynamic import for TS
// to allow a dependency on an ESM file.
export const mod = import('./module_extension.mjs');
