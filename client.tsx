import { HttpLink, InMemoryCache } from 'apollo-boost';
import { ApolloClient } from '@apollo/react-hooks';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import fetch from 'node-fetch';

export interface IApolloClientGeneratorOptions {
  initialStore?: any;
  token?: string;
  client?: string;
  secret?: string;
  ssl?: boolean;
  path?: string;
  headers?: any;
  ws?: boolean;
}

export function generateHeaders(options: IApolloClientGeneratorOptions) {
  const headers: IApolloClientGeneratorOptions['headers'] = { ...options.headers };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.secret) headers['x-hasura-admin-secret'] = options.secret;
  if (options.client) headers['x-hasura-client'] = options.client;
  return headers;
}

export function generateApolloClient(
  options: IApolloClientGeneratorOptions,
  forwardingArguments?: {
    ApolloClient?: any;
    InMemoryCache?: any;
  },
): ApolloClient<any> {
  const headers = generateHeaders(options);

  const httpLink = new HttpLink({
    uri: `http${options.ssl ? 's' : ''}://${options.path || ''}`,
    // @ts-ignore
    fetch,
    headers,
  });

  const wsLink = options.ws
    ? new WebSocketLink({
      uri: `ws${options.ssl ? 's' : ''}://${options.path || ''}`,
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

  const link = options.ws
    ? concat(wsLink, httpLink)
    : httpLink;

  return new ApolloClient({
    ssrMode: true,
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
        errorPolicy: 'all',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.watchQuery,
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
        ...forwardingArguments?.ApolloClient?.defaultOptions?.query,
      },
      ...forwardingArguments?.ApolloClient?.defaultOptions,
    },
  });
}