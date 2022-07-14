import {Log} from '../../utils/logging.js';
import fetch from 'node-fetch';

import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  AuthorizationServiceConfiguration as _AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  TokenRequest,
  TokenResponse,
} from '@openid/appauth';
import {NodeRequestor} from '@openid/appauth/built/node_support/node_requestor.js';
//import {NodeBasedHandler} from '@openid/appauth/built/node_support/node_request_handler.js';
import {NodeBasedHandler} from './node-handler.js';

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

export async function doTheOAuthDanceWithLoopback({
  loopback: {client_id, client_secret},
  authConfig,
  scope,
}: OAuthDanceConfig): Promise<TokenResponse> {
  if (client_id === undefined) {
    throw Error();
  }
  const requestor = new NodeRequestor();

  const notifier = new AuthorizationNotifier();
  const authorizationHandler = new NodeBasedHandler();

  authorizationHandler.setAuthorizationNotifier(notifier);

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

export async function doTheOAuthDanceWithOob({
  oob: {client_id, client_secret},
  authConfig,
  deviceAuthEndpoint,
  scope,
}: OAuthDanceConfig): Promise<TokenResponse> {
  if (client_id === undefined) {
    throw Error();
  }

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
      resp.json() as unknown as {
        verification_uri: string;
        verification_url: string;
        interval: number;
        user_code: string;
        expires_in: number;
        device_code: string;
      },
  );

  Log.info(`Please visit: ${response.verification_uri || response.verification_url}`);
  Log.info(`Enter your one time ID code: ${response.user_code}`);

  /**
   * The number of milliseconds to add to the requested internal from Google, utilized if Google requests
   * that our requests slow down.
   */
  let pollingBackoff = 2500;

  const oauthDanceTimeout = Date.now() + response.expires_in * 1000;

  while (true) {
    if (Date.now() > oauthDanceTimeout) {
      throw {
        authenticated: false,
        message: 'Failed to completed OAuth authentication before the user code expired.',
      };
    }
    // Wait for the requested interval before polling, this is done before the request as it is unnecessary to
    //immediately poll while the user has to perform the auth out of this flow.
    await new Promise((resolve) => setTimeout(resolve, response.interval * 1000 + pollingBackoff));

    const result = await pollAuthServer(
      authConfig.tokenEndpoint,
      response.device_code,
      client_id,
      client_secret,
    );
    if (!result.error) {
      return {
        ...result,
        idToken: result.id_token,
        accessToken: result.access_token,
      };
    }
    if (result.error === 'access_denied') {
      throw {
        authenticated: false,
        message: 'Unable to authorize, as access was denied during the OAuth flow.',
      };
    }

    if (result.error === 'authorization_pending') {
      // Update messaging.
    }

    if (result.error === 'slow_down') {
      // Update messaging.
      pollingBackoff += 5000;
    }

    if (
      result.error === 'invalid_client' ||
      result.error === 'unsupported_grant_type' ||
      result.error === 'invalid_grant' ||
      result.error === 'invalid_request'
    ) {
      throw {
        authenticated: false,
        message: result.errorDescription,
      };
    }
  }
}

async function pollAuthServer(
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
  }).then((x) => x.json() as Promise<any>);
}

export const GoogleOAuthDanceConfig: OAuthDanceConfig = {
  loopback: {
    client_id: '823469418460-ta0oojev0ovg2qlmv6kn46qiaebkr4gi.apps.googleusercontent.com',
    client_secret: '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',
  },
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
  loopback: {
    client_id: 'Iv1.58b338d4f1a5ba12',
    client_secret: '4a75aa1531f5ffa2b6ff793468ad2de90cb1d8cd',
  },
  oob: {
    client_id: 'Iv1.58b338d4f1a5ba12',
    client_secret: '4a75aa1531f5ffa2b6ff793468ad2de90cb1d8cd',
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
