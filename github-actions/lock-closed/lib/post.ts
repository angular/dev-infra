import {revokeAuthTokenFor, ANGULAR_LOCK_BOT} from '../../utils';

async function run(): Promise<void> {
  await revokeAuthTokenFor(ANGULAR_LOCK_BOT);
}

run();
