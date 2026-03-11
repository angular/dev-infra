/**
 * A generic test runner for brining up a server on a random port, waiting for the server to bind
 * to that port, and then running tests against it.
 */

import * as child_process from 'child_process';
import * as net from 'net';
import getRandomPort from 'get-port';
import {setTimeout} from 'node:timers/promises';

/** Unique error when tests failed. */
export class TestFailedError {}

/** Checks if the given port is bound. */
function isPortBound(port: number) {
  return new Promise<boolean>((resolve) => {
    const client = new net.Socket();
    client.once('connect', () => resolve(true));
    client.once('error', () => resolve(false));
    client.connect(port);
  });
}

/**
 * Returns a promise that resolves when the given port is bound, or rejects if it does not become
 * bound within the given timeout duration.
 */
async function waitForPortBound(
  port: number,
  timeout: number,
  abortSignal: AbortSignal,
): Promise<void> {
  if (abortSignal.aborted) {
    return;
  }
  const isBound = await isPortBound(port);
  if (isBound) {
    return;
  }
  if (timeout <= 0) {
    throw new Error('Timeout waiting for server to start');
  }
  const wait = Math.min(timeout, 500);
  return setTimeout(wait).then(async () => {
    await waitForPortBound(port, timeout - wait, abortSignal);
  });
}

/** Starts a server and runs a test against it. */
async function runTest(serverPath: string, testPath: string) {
  let server: child_process.ChildProcess | null = null;
  let testComplete = false;

  return new Promise<void>(async (resolve, reject) => {
    const port = await getRandomPort();
    const abortController = new AbortController();

    // Expose the chosen test server port so that the test environment can
    // connect to the server.
    process.env['TEST_SERVER_PORT'] = `${port}`;

    // Start the server.
    server = child_process.spawn(serverPath, [], {
      stdio: 'inherit',
      detached: true,
      env: {
        ...process.env,
        PORT: `${port}`,
      },
    });
    server.on('error', (error) => {
      reject(error);
    });
    server.on('close', (code, signal) => {
      if (testComplete) {
        return;
      }

      if (code !== 0 || signal !== null) {
        reject(Error(`Server exited with error. Code: ${code}, signal: ${signal}`));
        abortController.abort();
      }
      server = null;
    });

    // Wait for the server to bind to the port, then run the tests.
    await waitForPortBound(port, 10000, abortController.signal);

    // Server aborted before, and promise already rejected.
    if (abortController.signal.aborted) {
      return;
    }

    const test = child_process.spawnSync(testPath, {stdio: 'inherit'});

    testComplete = true;
    if (server.pid) {
      // Try kill full process group.
      process.kill(-server.pid, 'SIGTERM');
    } else {
      server.kill('SIGTERM');
    }

    if (test.status === 0) {
      resolve();
    } else {
      reject(new TestFailedError());
    }
  });
}

async function main() {
  const [serverRootpath, testRootpath] = process.argv.slice(2);
  await runTest(serverRootpath, testRootpath);
}

main().catch((e) => {
  if (e instanceof TestFailedError) {
    console.error('Tests failed.');
  } else {
    console.error(e);
  }
  process.exitCode = 1;
});
