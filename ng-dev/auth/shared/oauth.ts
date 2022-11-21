import {Log} from '../../utils/logging.js';
import fetch from 'node-fetch';

import {
  AuthorizationError,
  AuthorizationErrorJson,
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest,
  TokenResponse,
  TokenResponseJson,
} from '@openid/appauth';
import {NodeRequestor} from '@openid/appauth/built/node_support/node_requestor.js';
import {NodeBasedHandler} from '@openid/appauth/built/node_support/node_request_handler.js';
import {Spinner} from '../../utils/spinner.js';

interface OAuthDanceConfig {
  authConfig: AuthorizationServiceConfiguration;
  deviceAuthEndpoint: string;
  oob: {
    client_id: string;
    client_secret?: string;
  };
  loopback: {
    client_id: string;
    client_secret?: string;
  };
  scope: string;
}

export async function authorizationCodeOAuthDance({
  loopback: {client_id, client_secret},
  authConfig,
  scope,
}: OAuthDanceConfig): Promise<TokenResponse> {
  /** Requestor instance for NodeJS usage. */
  const requestor = new NodeRequestor();
  /** Notifier to watch for authorization completion. */
  const notifier = new AuthorizationNotifier();
  /** Handler for node based requests. */
  const authorizationHandler = new NodeBasedHandler();

  authorizationHandler.setAuthorizationNotifier(notifier);

  /** The authorization request. */
  let request = new AuthorizationRequest({
    client_id,
    scope,
    redirect_uri: 'http://127.0.0.1:' + authorizationHandler.httpServerPort,
    response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
    extras: {
      'access_type': 'offline',
    },
  });

  authorizationHandler.performAuthorizationRequest(authConfig, request);
  await authorizationHandler.completeAuthorizationRequestIfPossible();
  const authorization = await authorizationHandler.authorizationPromise;
  const authorizationCode = authorization!.response!.code;
  notifier.onAuthorizationComplete(
    authorization!.request,
    authorization!.response,
    authorization!.error,
  );

  const tokenHandler = new BaseTokenRequestHandler(requestor);
  const tokenRequest = new TokenRequest({
    client_id,
    redirect_uri: 'http://127.0.0.1:' + authorizationHandler.httpServerPort,
    grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
    code: authorizationCode,
    extras: {
      client_secret: client_secret || '',
    },
  });

  return await tokenHandler.performTokenRequest(authConfig, tokenRequest).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

export async function deviceCodeOAuthDance({
  oob: {client_id, client_secret},
  authConfig,
  deviceAuthEndpoint,
  scope,
}: OAuthDanceConfig): Promise<TokenResponse> {
  // Set up and configure the authentication url to initiate the OAuth dance.
  const url = new URL(deviceAuthEndpoint);
  url.searchParams.append('scope', scope);
  url.searchParams.append('client_id', client_id);
  url.searchParams.append('response_type', AuthorizationRequest.RESPONSE_TYPE_CODE);

  // Request the device and user codes to begin OAuth dance for our application.
  // https://developers.google.com/identity/protocols/oauth2/limited-input-device#step-1:-request-device-and-user-codes
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {'Accept': 'application/json'},
  }).then(
    (resp) =>
      resp.json() as Promise<{
        verification_uri: string;
        verification_url: string;
        interval: number;
        user_code: string;
        expires_in: number;
        device_code: string;
      }>,
  );

  if (
    isAuthorizationError(response) &&
    (response.error === 'invalid_client' ||
      response.error === 'unsupported_grant_type' ||
      response.error === 'invalid_grant' ||
      response.error === 'invalid_request')
  ) {
    throw new OAuthDanceError(new AuthorizationError(response).errorDescription || 'Unknown Error');
  }

  Log.info(`  Please visit: ${response.verification_uri || response.verification_url}`);
  Log.info(`  Enter your one time ID code: ${response.user_code}`);
  Log.info('');

  const pollingSpinner = new Spinner('Polling auth server for login confirmation');

  /**
   * The number of milliseconds to add to the requested internal from Google, utilized if Google requests
   * that our requests slow down.
   */
  let pollingBackoff = 2500;

  const oauthDanceTimeout = Date.now() + response.expires_in * 1000;

  try {
    while (true) {
      if (Date.now() > oauthDanceTimeout) {
        throw new OAuthDanceError(
          'Failed to completed OAuth authentication before the user code expired.',
        );
      }
      // Wait for the requested interval before polling, this is done before the request as it is unnecessary to
      //immediately poll while the user has to perform the auth out of this flow.
      await new Promise((resolve) =>
        setTimeout(resolve, response.interval * 1000 + pollingBackoff),
      );

      const result = await checkStatusOfAuthServer(
        authConfig.tokenEndpoint,
        response.device_code,
        client_id,
        client_secret,
      );

      if (!isAuthorizationError(result)) {
        return new TokenResponse(result);
      }
      if (result.error === 'access_denied') {
        throw new OAuthDanceError(
          'Unable to authorize, as access was denied during the OAuth flow.',
        );
      }

      if (result.error === 'slow_down') {
        Log.debug('"slow_down" response from server, backing off polling interval by 5 seconds');
        pollingBackoff += 5000;
      }
    }
  } finally {
    pollingSpinner.update('');
    pollingSpinner.complete();
  }
}

async function checkStatusOfAuthServer(
  serverUrl: string,
  deviceCode: string,
  clientId: string,
  clientSecret?: string,
) {
  const url = new URL(serverUrl);
  if (clientSecret) {
    url.searchParams.append('client_secret', clientSecret);
  }
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('device_code', deviceCode);
  url.searchParams.append('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');

  return await fetch(url.toString(), {
    method: 'POST',
    headers: {'Accept': 'application/json'},
  }).then((x) => x.json() as Promise<TokenResponseJson | AuthorizationErrorJson>);
}

// NOTE: the `client_secret`s are okay to be included in this code as these values are sent
// in the clear in HTTP requests anyway.

export const GoogleOAuthDanceConfig: OAuthDanceConfig = {
  /** client_id and client_secret for "ng-dev CLI" in the DevInfra GCP project. */
  loopback: {
    client_id: '823469418460-ta0oojev0ovg2qlmv6kn46qiaebkr4gi.apps.googleusercontent.com',
    client_secret: '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',
  },
  /** client_id and client_secret for "ng-dev CLI Out of Band" in the DevInfra GCP project. */
  oob: {
    client_id: '823469418460-puj3s53su005dp2ima1uim3gil2uggur.apps.googleusercontent.com',
    client_secret: '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',
  },
  scope: ['profile', 'email'].join(' '),
  authConfig: new AuthorizationServiceConfiguration({
    authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_endpoint: 'https://oauth2.googleapis.com/token',
    revocation_endpoint: 'https://oauth2.googleapis.com/revoke',
    end_session_endpoint: undefined,
    userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  }),
  deviceAuthEndpoint: 'https://oauth2.googleapis.com/device/code',
};

export const GithubOAuthDanceConfig: OAuthDanceConfig = {
  /** client_id and client_secret for ng-caretaker Github App. */
  loopback: {
    client_id: 'Iv1.57e16107abc663d9',
    client_secret: 'c9b2b8cfbd59d6a36311607154dccabd8ce042e6',
  },
  oob: {
    client_id: 'Iv1.57e16107abc663d9',
    client_secret: 'c9b2b8cfbd59d6a36311607154dccabd8ce042e6',
  },
  scope: [].join(' '),
  authConfig: new AuthorizationServiceConfiguration({
    authorization_endpoint: 'https://github.com/login/oauth/authorize',
    token_endpoint: 'https://github.com/login/oauth/access_token',
    revocation_endpoint: '',
    end_session_endpoint: undefined,
    userinfo_endpoint: '',
  }),
  deviceAuthEndpoint: 'https://github.com/login/device/code',
};

class OAuthDanceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function isAuthorizationError<T>(
  result: T | AuthorizationErrorJson,
): result is AuthorizationErrorJson {
  if ((result as AuthorizationErrorJson).error !== undefined) {
    return true;
  }
  return false;
}
