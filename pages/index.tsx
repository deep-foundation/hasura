import React from 'react';
import Head from 'next/head';
import { TokenContext, useToken } from '@deepcase/react-hasura/token-context';
import { ApolloClientTokenizedProvider } from '@deepcase/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider, useLocalStore } from '@deepcase/store/local';
import { gql } from 'graphql-tag';
import { useQuery, useSubscription } from '@apollo/react-hooks';

function useDemoTokenController() {
  return useLocalStore('demo-token', 'demo');
}
export function DemoTokenProvider({ children }: { children?: any }) {
  const [token, setToken] = useDemoTokenController();
  return <TokenContext.Provider value={token}>{children}</TokenContext.Provider>
}

export const AUTH_TEST = gql`query AUTH_TEST { authTest { userId role } }`;
export const USERS = gql`query USERS { users:hasura_example_auth_users { id role tokens { id token } } }`;

export function PageConnected() {
  const [,setToken] = useDemoTokenController();
  const token = useToken();
  const aq = useQuery(AUTH_TEST);
  const uq = useQuery(USERS);
  return <>
    <div>token: {token}</div>
    <div><button onClick={() => {
      setToken(Math.random().toString(36).substring(7));
    }}>randomizeToken</button></div>
    <div>(apollo client will be reconnected and refresh each old query/subscription)</div>
    <div>(if token is not exists (randomized token is new, ofcourse not exists), create new guest user)</div>
    <div>gql request</div>
    <div>{`query AUTH_TEST { authTest { userId role } }`}</div>
    <div>gql response</div>
    <div>{JSON.stringify(aq?.error)}</div>
    <div>{JSON.stringify(aq?.data)}</div>
    <div>users:</div>
    <div style={{ padding: 3 }}>
      {(uq?.data?.users || []).map(user => (
        <div style={{ marginBottom: 3, padding: 3, border: '1px dashed gray', overflow: 'hidden' }}>
          <div>{user.id} {user.role}</div>
          <div>
            <div style={{ margin: 3, padding: 3, float: 'left' }}>
              tokens:
            </div>
            {(user?.tokens || []).map(token => (
              <button style={{ margin: 3, padding: 3, float: 'left' }} onClick={() => setToken(token.token)}>
                {token.id} {token.token}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </>
}

export default function Page() {
  return (
    <LocalStoreProvider>
      <DemoTokenProvider>
        <ApolloClientTokenizedProvider options={{ client: 'hasura-example-client', path: `${process.env.HASURA_PATH}/v1/graphql`, ssl: !!+process.env.HASURA_SSL, ws: !!process?.browser }}>
          <PageConnected/>
        </ApolloClientTokenizedProvider>
      </DemoTokenProvider>
    </LocalStoreProvider>
  );
}
