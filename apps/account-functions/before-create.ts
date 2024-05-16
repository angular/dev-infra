import {Auth, https, UserRecord} from 'gcip-cloud-functions';

/**
 * Validate accounts before their creation using google cloud before create
 * synchronous function.
 */
export const beforeCreate = new Auth().functions().beforeCreateHandler((user: UserRecord) => {
  if (user.email && !user.email.endsWith('@google.com')) {
    throw new https.HttpsError('invalid-argument', `Unauthorized email "${user.email}"`);
  }

  return {};
});
