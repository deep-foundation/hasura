import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { TokenContext, useToken } from '@deepcase/react-hasura/token-context';
import { ApolloClientTokenizedProvider } from '@deepcase/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider, useLocalStore } from '@deepcase/store/local';
import gql from 'graphql-tag';
import { useQuery, useSubscription, useApolloClient } from '@apollo/react-hooks';

function useDemoTokenController() {
  return useLocalStore('demo-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiZGVtbyJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJkZW1vIiwieC1oYXN1cmEtdXNlci1pZCI6ImRlbW8ifSwiaWF0IjoxNjE5NzQyMjc2fQ.gxyHe-ChrYmLg6N09pANxYOh9cskA6JrWICjNglT4ps');
}
export function DemoTokenProvider({ children }: { children?: any }) {
  const [token, setToken] = useDemoTokenController();
  return <TokenContext.Provider value={token}>{children}</TokenContext.Provider>
}

export const AUTH_TEST = gql`query AUTH_TEST { authTest { userId role } }`;
export const JWT = gql`query JWT($userId: String, $role: String) { jwt(jwt: { userId: $userId, role: $role }) { userId role token } }`;
export const USERS = gql`query USERS { users:hasura_example_auth_users { id role tokens { id token } } }`;

export function PageConnected() {
  const apolloClient = useApolloClient();
  const [,setToken] = useDemoTokenController();
  const token = useToken();
  const [input, setInput] = useState({ userId: 'demo', role: 'demo' });
  const jwt = useQuery(JWT, { variables: { ...input } });
  useEffect(() => {
    jwt.refetch();
  }, [input]);
  useEffect(() => {
    if (jwt?.data?.jwt?.token) setToken(jwt?.data?.jwt?.token);
  }, [jwt]);
  const aq = useQuery(AUTH_TEST);
  const uq = useQuery(USERS);
  return <>
    <div>userId: {input.userId}</div>
    <div>role: {input.role}</div>
    <div>token: {token}</div>
    <div><button onClick={() => {
      const userId = Math.random().toString(36).substring(7);
      const role = 'user';
      setInput({ userId, role });
    }}>randomize</button></div>
    <div>(apollo client will be reconnected and refresh each old query/subscription)</div>
    <div>(randomize - update jwt token based new userId/role - save token - update AuthTest based new token)</div>
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
        <ApolloClientTokenizedProvider options={{ client: 'hasura-example-client', path: `${process.env.NEXT_PUBLIC_HASURA_PATH}/v1/graphql`, ssl: !!+process.env.NEXT_PUBLIC_HASURA_SSL, ws: false }}>
          <PageConnected/>
        </ApolloClientTokenizedProvider>
      </DemoTokenProvider>
    </LocalStoreProvider>
  );
}
