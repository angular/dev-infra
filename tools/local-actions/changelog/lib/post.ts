import {revokeAuthTokenFor, ANGULAR_ROBOT} from '../../../../github-actions/utils.js';

async function run(): Promise<void> {
  await revokeAuthTokenFor(ANGULAR_ROBOT);
}

run();
