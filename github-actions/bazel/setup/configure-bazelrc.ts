import {cpus, totalmem} from 'os';
import {appendFileSync, readFileSync} from 'fs';

/** Path to the provided bazelrc file. */
const bazelRcPath = process.env['BAZELRC_PATH'];

if (bazelRcPath === undefined) {
  throw Error('BAZELRC_PATH environment variable was not provided');
}

/** Total CPU cores available on the system. */
const totalCpus = cpus().length;
/** Total RAM available on the system in MB */
const totalRAM = Math.floor(totalmem() / 1e6);
/** Block of configuration to add to the provided bazelrc file. */
const configurationBlockToAppend = `
build --repository_cache=~/.cache/bazel_repo_cache
common --local_cpu_resources=${totalCpus}
common --local_ram_resources=${totalRAM}
`;

// Append the configuration block to the provided bazelrc file.
appendFileSync(bazelRcPath, configurationBlockToAppend, {encoding: 'utf-8'});

// Log the entire bazelrc file, showing the inclusion of the new configuration block.
console.log(readFileSync(bazelRcPath, {encoding: 'utf-8'}));
