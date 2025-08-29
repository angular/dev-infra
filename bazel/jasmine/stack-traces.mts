import {install} from 'source-map-support';

// Set up source map support to ensure we are logging the stack trace for the source file (i.e. .ts file) and
// not the generated file (i.e. .js. file).
install();

/** The root path that the test files are running from within. */
let basePath = `${process.env.RUNFILES}/${process.env.TEST_WORKSPACE}/`;
/** Regex to capture the content and name of the function in the stack trace. */
const basePathRegex = new RegExp(`(at.*)file.*${basePath}`, 'g');

// Replace the prepareStackTrace function with one which replaces the full path execution location with
// relative paths to the base of the workspace source files.
const originalPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = function (e, s) {
  return originalPrepareStackTrace(e, s).replaceAll(basePathRegex, '$1./');
};
