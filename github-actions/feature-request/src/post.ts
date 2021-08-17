import {revokeAuthTokenFor, ANGULAR_ROBOT} from '../../utils';

async function run(): Promise<void> {
  await revokeAuthTokenFor(ANGULAR_ROBOT);
}

run();
