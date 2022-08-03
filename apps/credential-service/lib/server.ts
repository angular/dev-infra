#!/usr/bin/env node

import {createServer, IncomingHttpHeaders, IncomingMessage} from 'http';
import {WebSocketServer, WebSocket} from 'ws';
import {Octokit} from '@octokit/rest';
import {createAppAuth} from '@octokit/auth-app';
import {Duplex} from 'stream';
import admin, {AppOptions} from 'firebase-admin';
import assert from 'assert';

/** The temporary access token and a convience method for revoking it. */
interface AccessTokenAndRevocation {
  token: string;
  revokeToken: () => void;
}

interface RequestParameterHeaders extends IncomingHttpHeaders {
  ng_repo_name: string;
  ng_repo_owner: string;
}

/** Regex for matching authorization header uses. */
const authorizationRegex = new RegExp(/Bearer (.*)/);
/** The length of time in ms between heartbeat checks. */
const heartBeatIntervalLength = 10000;
/** The port to bind the server to */
const PORT = 8080;
/** The ID of the Github app used to generating tokens. */
assert(process.env.GITHUB_APP_ID, 'GITHUB_APP_ID is not defined in the environment');
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
/** The PEM key of the Github app used to generating tokens. */
assert(process.env.GITHUB_APP_PEM, 'GITHUB_APP_PEM is not defined in the environment');
const GITHUB_APP_PEM = process.env.GITHUB_APP_PEM;
/** The firebase confgiuration for the firebase application being used for authentication. */
assert(process.env.FIREBASE_APP_CONFIG, 'FIREBASE_APP_CONFIG is not defined in the environment');
const FIREBASE_APP_CONFIG = JSON.parse(process.env.FIREBASE_APP_CONFIG) as AppOptions;

// Initialize the Firebase application.
admin.initializeApp(FIREBASE_APP_CONFIG);

/** Generate a temporary access token with access to the requested repository. */
export async function generateAccessToken(
  owner: string,
  repo: string,
): Promise<AccessTokenAndRevocation> {
  /** The github client used for generating the token. */
  const github = new Octokit({
    authStrategy: createAppAuth,
    auth: {appId: GITHUB_APP_ID, privateKey: GITHUB_APP_PEM},
  });
  /** The specific installation id for the provided repository. */
  const {id: installation_id} = (await github.apps.getRepoInstallation({owner, repo})).data;
  /** A temporary github access token. */
  const {token} = (await github.rest.apps.createInstallationAccessToken({installation_id})).data;

  return {
    token,
    revokeToken: async () => await new Octokit({auth: token}).apps.revokeInstallationAccessToken(),
  };
}

/**
 * WebSocket handler to generate temporary Github access token.
 *
 * The access token is automatically revoked when the websocket is closed.
 */
async function wsHandler(ws: WebSocket, req: IncomingMessage) {
  /** Whether the websocket has confirmed the heartbeat response since the most recent check. */
  let receivedHeartbeatResponse: boolean;
  /** The interval instance for checking the heartbeat. */
  let heartbeatInterval = setInterval(checkHeartbeat, heartBeatIntervalLength);
  /**
   * The repository name and owner for the request.
   * Note: We safely case the header type as having these fields because they are checked prior
   *       to the WebSocket handler function being invoked.
   */
  const {ng_repo_owner: owner, ng_repo_name: repo} = req.headers as RequestParameterHeaders;

  /** The temporary Github access token and function to revoke the token.. */
  const {token, revokeToken} = await generateAccessToken(owner, repo);
  /** Check to make sure the heartbeat is still alive. */
  function checkHeartbeat() {
    if (receivedHeartbeatResponse === false) {
      ws.close(1008, 'Cannot find socket via heartbeat check');
      ws.terminate();
    }
    receivedHeartbeatResponse = false;
    ws.ping();
  }

  /**
   * Cleans up the state of the function when the WebSocket is completed.
   */
  async function complete() {
    await revokeToken();
    clearInterval(heartbeatInterval);
  }

  // Ensure that cleanup is done when the WebSocket closes.
  ws.on('close', complete);
  ws.on('error', complete);

  // Handle the pong response from the websocket client, updating the heartbeat as alive.
  ws.on('pong', () => (receivedHeartbeatResponse = true));

  // Send the temporary Github token to the websocket client
  ws.send(token);
}

/**
 * Handle upgrade requests before the websocket is used. Enforces authentication mechanisms
 * and ensuring the required data is present in the request.
 */
async function upgradeHandler(req: IncomingMessage, socket: Duplex, head: Buffer) {
  try {
    assert(req.headers.authorization, Error('Missing authorization header'));
    if (!authorizationRegex.test(req.headers.authorization)) {
      throw Error('Invalid authorization header syntax');
    }
    /**
     * The NgDev token from the user to be verified.
     * We use a non-null assertion as the regex was already tested above.
     */
    const [_, ngDevToken] = authorizationRegex.exec(req.headers.authorization)!;
    await admin
      .auth()
      .verifySessionCookie(ngDevToken, /* checkRevoked */ true)
      .then((decodedToken: admin.auth.DecodedIdToken) => {
        console.log(`Verified login of ${decodedToken.email}`);
      });
  } catch (e) {
    console.error('Unable to verified authorized user');
    console.error(e);
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  /** The repository name and owner for the request. */
  const {ng_repo_name: repo, ng_repo_owner: owner} = req.headers as RequestParameterHeaders;

  if (!repo || !owner) {
    console.error('Missing a repo or owner parameter');
    socket.write('HTTP/1.1 400 Bad Reqest\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws: WebSocket, msg: IncomingMessage) => {
    wss.emit('connection', ws, msg);
  });
}

/** The http web server. */
const server = createServer();
/** The websocket server to handle websocket requests. */
const wss = new WebSocketServer({noServer: true});

wss.on('connection', wsHandler);
server.on('upgrade', upgradeHandler);
server.on('listening', () => console.log('Credential Service startup complete, listening'));
server.listen(PORT);
