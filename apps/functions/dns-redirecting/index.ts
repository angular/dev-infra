import * as functions from 'firebase-functions';

export const dnsRedirecting = functions
  .runWith({
    invoker: 'public',
    timeoutSeconds: 5,
    minInstances: 1,
    maxInstances: 2,
  })
  .https.onRequest(async (request, response) => {
    let redirectType = 301;
    /** The hostname that was used for the request. */
    let hostname = request.hostname;

    // If a hostname is provided as a query param, use it instead. This allows us to verify redirects prior to the
    // DNS records being setup. We use a 302 redirect for this as its a temporary check.
    if (request.query['hostname']) {
      hostname = request.query['hostname'] as string;
      redirectType = 302;
    }

    if (hostname === 'update.angular.dev') {
      response.redirect(redirectType, 'https://angular.dev/update-guide');
    }
    if (hostname === 'update.angular.io') {
      response.redirect(redirectType, 'https://angular.dev/update-guide');
    }
    if (hostname === 'cli.angular.io') {
      response.redirect(redirectType, 'https://angular.dev/cli');
    }
    if (hostname === 'cli.angular.dev') {
      response.redirect(redirectType, 'https://angular.dev/cli');
    }
    if (hostname === 'blog.angular.io') {
      response.redirect(redirectType, 'https://blog.angular.dev');
    }

    // If no redirect is matched, we return a failure message
    response.status(404);
    response.send(`No redirect defined for ${request.originalUrl}`);
  });
