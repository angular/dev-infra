import {Auth, https, UserRecord} from 'gcip-cloud-functions';

/** Validate accounts before their creation using google cloud before create syncronous function. */
export const beforeCreate = new Auth().functions().beforeCreateHandler((user: UserRecord) => {
  if (user.email && user.email.indexOf('@google.com') === -1) {
    throw new https.HttpsError('invalid-argument', `Unauthorized email "${user.email}"`);
  }

  return {};
});
