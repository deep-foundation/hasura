import { HttpLink, InMemoryCache, ApolloClient as BaseApolloClient } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import fetch from 'node-fetch';
import path from 'path';
import Debug from 'debug';

export type ApolloClient = BaseApolloClient<any> & {
  path: string;
  ssl: boolean;
}

const debug = Debug('hasura:client');

let ws;
if (typeof(window) !== 'object') {
  ws = require('ws');
}

const DEEP_FOUNDATION_HASURA_RELATIVE: boolean | undefined = ((r) => r ? !!+r : undefined)(process.env.DEEP_FOUNDATION_HASURA_RELATIVE);
const NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE: boolean | undefined = ((r) => r ? !!+r : undefined)(process.env.NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE);

const ENV_RELATIVE = typeof(DEEP_FOUNDATION_HASURA_RELATIVE) === 'boolean' ? DEEP_FOUNDATION_HASURA_RELATIVE : typeof(NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE) === 'boolean' ? NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE : undefined;
export interface IApolloClientGeneratorOptions {
  initialStore?: any;
  token?: string;
  client?: string;
  secret?: string;
  ssl?: boolean;
  path?: string;
  headers?: any;
  ws?: boolean;
  relative?: boolean;
}

export function generateHeaders(options: IApolloClientGeneratorOptions) {
  const headers: IApolloClientGeneratorOptions['headers'] = { ...options.headers };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.secret) headers['x-hasura-admin-secret'] = options.secret;
  if (options.client) headers['x-hasura-client'] = options.client;
  return headers;
}

export interface IApolloClient<T> extends ApolloClient<T> {
  jwt_token?: string;
  path?: string;
  ssl?: boolean;
}

const host = typeof(window) === 'object' ? window.location.host : '';

export function generateApolloClient(
  options: IApolloClientGeneratorOptions,
  forwardingArguments?: {
    ApolloClient?: any;
    InMemoryCache?: any;
  },
): ApolloClient {
  debug('generateApolloClient', options, forwardingArguments);

  const client: ApolloClient = new ApolloClient({
    ssrMode: true,
    // @ts-ignore
    link: concat(authMiddleware, link),
    connectToDevTools: true,
    cache: new InMemoryCache({
      ...forwardingArguments?.InMemoryCache,
      freezeResults: false,
      resultCaching: false,
    }).restore(options.initialStore || {}),
    ...forwardingArguments?.ApolloClient,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        // errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.watchQuery,
      },
      query: {
        fetchPolicy: 'no-cache',
        // errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.query,
      },
      ...forwardingArguments?.ApolloClient?.defaultOptions,
    },
  });
    operation.setContext({
      headers,
    });

    return forward(operation);
  });

  const link = !options.ws
    ? httpLink
    : split(
        ({ query }) => {
          // return true;
          // if you need ws only for subscriptions:
          const def = getMainDefinition(query);
          return def?.kind === 'OperationDefinition' && def?.operation === 'subscription';
        },
        wsLink,
        // @ts-ignore
        httpLink,
      );

  const client: IApolloClient<any> = new ApolloClient({
    ssrMode: true,
    // @ts-ignore
    link: concat(authMiddleware, link),
    connectToDevTools: true,
    cache: new InMemoryCache({
      ...forwardingArguments?.InMemoryCache,
      freezeResults: false,
      resultCaching: false,
    }).restore(options.initialStore || {}),
    ...forwardingArguments?.ApolloClient,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        // errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.watchQuery,
      },
      query: {
        fetchPolicy: 'no-cache',
        // errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.query,
      },
      ...forwardingArguments?.ApolloClient?.defaultOptions,
    },
  });

  client.jwt_token = options.token;
  client.path = options.path;
  client.ssl = options.ssl;

  return client;
}
