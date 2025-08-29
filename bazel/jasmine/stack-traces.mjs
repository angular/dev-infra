import {install} from 'source-map-support';

// Set up source map support to ensure we are logging the stack trace for the source file (i.e. .ts file) and
// not the generated file (i.e. .js. file).
install();

/** The root path that the test files are running from within. */
let rootPath = `${process.env.RUNFILES}/${process.env.TEST_WORKSPACE}/`;
/** The root path match for when test files are not within the sandbox, but the executation is happening within the sandbox. */
let sandboxPath = `/.*${process.env.JS_BINARY__WORKSPACE}/${process.env.JS_BINARY__BINDIR}/`;
/** Regex to capture the content and name of the function in the stack trace. */
const basePathRegex = new RegExp(`(at.*)(?:file.*${rootPath}|file.*${sandboxPath})`, 'g');

// Replace the prepareStackTrace function with one which replaces the full path execution location with
// relative paths to the base of the workspace source files.
const originalPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = function (e, s) {
  return originalPrepareStackTrace(e, s).replaceAll(basePathRegex, '$1./');
};
