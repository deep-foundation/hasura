import { HttpLink, InMemoryCache, ApolloClient } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import fetch from 'node-fetch';

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
}

export function generateApolloClient(
  options: IApolloClientGeneratorOptions,
  forwardingArguments?: {
    ApolloClient?: any;
    InMemoryCache?: any;
  },
): ApolloClient<any> {
  const isRelative = typeof(options?.relative) === 'boolean' ? options.relative : typeof(ENV_RELATIVE) === 'boolean' ? ENV_RELATIVE : false;
  const headers = generateHeaders(options);

  const httpLink = new HttpLink({
    uri: `${isRelative ? '' : `http${options.ssl ? 's' : ''}://`}${options.path || ''}`,
    // @ts-ignore
    fetch,
    headers,
  });

  const wsLink = options.ws
    ? new WebSocketLink({
      uri: `${isRelative ? '' : `ws${options.ssl ? 's' : ''}://`}${options.path || ''}`,
      options: {
        lazy: true,
        reconnect: true,
        connectionParams: () => ({
          headers,
        }),
      },
    })
    : null;

  const authMiddleware = new ApolloLink((operation, forward) => {
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
        errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.watchQuery,
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.query,
      },
      ...forwardingArguments?.ApolloClient?.defaultOptions,
    },
  });

  client.jwt_token = options.token;

  return client;
}
