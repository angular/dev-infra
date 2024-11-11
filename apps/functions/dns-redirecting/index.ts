import * as functions from 'firebase-functions';

export const dnsRedirecting = functions.https.onRequest(
  {
    invoker: 'public',
    timeoutSeconds: 5,
    minInstances: 1,
    maxInstances: 2,
  },
  async (request, response) => {
    /** The type of redirect to use, defaulting to a 301 permanent redirect. */
    let redirectType = 301;
    /** The hostname that was used for the request. */
    let hostname = request.hostname;

    if (request.hostname === 'dns.angular.dev') {
      // If a hostname is provided as a query param, use it instead. This allows us to verify redirects prior to the
      // DNS records being setup. We use a 302 redirect for this as its a temporary check.
      if (request.query['hostname']) {
        hostname = request.query['hostname'] as string;
        redirectType = 302;
      } else {
        response.status(200);
        response.send(
          'No content available at this page, redirects will be made for requests at the registered subdomain.',
        );
        return;
      }
    }

    if (hostname === 'code-of-conduct.angular.io') {
      response.redirect(redirectType, 'https://code-of-conduct.angular.dev');
    }
    if (hostname === 'update.angular.dev') {
      response.redirect(redirectType, 'https://angular.dev/update-guide');
    }
    if (hostname === 'update.angular.io') {
      response.redirect(redirectType, 'https://angular.dev/update-guide');
    }
    if (hostname === 'cli.angular.io') {
      response.redirect(redirectType, 'https://angular.dev/tools/cli');
    }
    if (hostname === 'cli.angular.dev') {
      response.redirect(redirectType, 'https://angular.dev/tools/cli');
    }
    if (hostname === 'blog.angular.io') {
      response.redirect(redirectType, `https://blog.angular.dev${request.originalUrl}`);
    }

    // If no redirect is matched, we return a failure message
    response.status(404);
    response.send(
      `No redirect defined for ${request.protocol}://${request.hostname}${request.originalUrl}`,
    );
  },
);
