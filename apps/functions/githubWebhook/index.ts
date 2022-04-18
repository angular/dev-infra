import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {handlePullRequestEvent} from './pull-request';
import {handleStatusEvent} from './status';
import {StatusEvent} from '@octokit/webhooks-types';

admin.initializeApp({...functions.firebaseConfig()});

/**
 * Firebase function to handle all incoming webhooks from Github. This function checks the incoming
 * webhook to ensure it is a valid request from Github, and then delegates processing of a payload
 * to one of the other githubWebhook functions.
 */
export const githubWebhook = functions
  .runWith({invoker: 'public', timeoutSeconds: 30, minInstances: 1})
  .https.onRequest(async (request, response) => {
    if (request.method !== 'POST') {
      response.status(405);
      response.send('Requests must be made using the POST method.');
      return;
    }
    if (request.headers['content-type'] !== 'application/json') {
      response.status(415);
      response.send('Request payloads must be "application/json".');
      return;
    }

    if (request.get('X-GitHub-Event') === 'pull_request') {
      await handlePullRequestEvent(request.body);
      response.send(`Handled pull request update for pr #${request.body.pull_request.number}`);
      response.end();
      return;
    }

    if (request.get('X-GitHub-Event') === 'status') {
      const statusEvent = request.body as StatusEvent;
      await handleStatusEvent(statusEvent);
      response.send(
        `Handled status update for status for commit ${statusEvent.sha} with the context ${statusEvent.context}`,
      );
      response.end();
      return;
    }

    response.end();
  });
