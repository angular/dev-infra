// This file can be executed directly for the workspace stamping in this repo.
// More details can be found in the `.bazelrc` file.
import yargs from 'yargs';
import {BuildEnvStampCommand} from './cli.js';

// TODO(ESM): Remove this when we use a dynamic import for config loading.
import {createRequire as __cjsCompatRequire} from 'module';
global.require = __cjsCompatRequire(import.meta.url);

yargs(process.argv.slice(2))
  .help()
  .strict()
  .demandCommand()
  .command(BuildEnvStampCommand)
  .parseAsync();
