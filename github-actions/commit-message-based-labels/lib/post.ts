import {revokeAuthTokenFor, ANGULAR_ROBOT} from '../../utils.js';

async function run(): Promise<void> {
  await revokeAuthTokenFor(ANGULAR_ROBOT);
}

run();
