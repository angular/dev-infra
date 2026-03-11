import assert from 'node:assert';

const testServerPort = process.env['TEST_SERVER_PORT'];
assert(testServerPort, 'Expected test server port.');

const response = await fetch(`http://localhost:${testServerPort}`);
assert((await response.text()) === 'Hello World!');
