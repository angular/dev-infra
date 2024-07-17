import * as functions from 'firebase-functions';

export const dnsRedirecting = functions
  .runWith({
    invoker: 'public',
    timeoutSeconds: 5,
    minInstances: 1,
    maxInstances: 2,
  })
  .https.onRequest(async (request, response) => {
    if (request.hostname === 'update.angular.dev') {
      response.redirect(301, 'https://angular.dev/update-guide');
    }
    if (request.hostname === 'update.angular.io') {
      response.redirect(301, 'https://angular.dev/update-guide');
    }
    if (request.hostname === 'cli.angular.io') {
      response.redirect(301, 'https://angular.dev/cli');
    }
    if (request.hostname === 'cli.angular.dev') {
      response.redirect(301, 'https://angular.dev/cli');
    }

    // If no redirect is matched, we return a failure message
    response.status(404);
    response.send(`No redirect defined for ${request.originalUrl}`);
  });
