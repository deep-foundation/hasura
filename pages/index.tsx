import React from 'react';
import Head from 'next/head';
import { TokenContext, useToken } from '@deepcase/react-hasura/token-context';
import { ApolloClientTokenizedProvider } from '@deepcase/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider, useLocalStore } from '@deepcase/store/local';
import { gql } from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

function useDemoTokenController() {
  return useLocalStore('demo-token', 'demo');
}
function DemoTokenProvider({ children }: { children?: any }) {
  const [token, setToken] = useDemoTokenController();
  return <TokenContext.Provider value={token}>{children}</TokenContext.Provider>
}

export const AUTH_TEST = gql`query AUTH_TEST { authTest { userId role } }`;

export function PageConnected() {
  const [,setToken] = useDemoTokenController();
  const token = useToken();
  const q = useQuery(AUTH_TEST);
  return <>
    <div>token: {token}</div>
    <div><button onClick={() => {
      setToken(Math.random().toString(36).substring(7));
    }}>randomizeToken</button></div>
    <div>(apollo client will be reconnected and refresh each old query/subscription)</div>
    <div>gql request</div>
    <div>{`query AUTH_TEST { authTest { userId role } }`}</div>
    <div>gql response</div>
    <div>{JSON.stringify(q?.error)}</div>
    <div>{JSON.stringify(q?.data)}</div>
  </>
}

export default function Page() {
  return (
    <LocalStoreProvider>
      <DemoTokenProvider>
        <ApolloClientTokenizedProvider options={{ client: 'hasura-example', path: `${process.env.HASURA_PATH}/v1/graphql`, ssl: !!+process.env.HASURA_SSL }}>
          <PageConnected/>
        </ApolloClientTokenizedProvider>
      </DemoTokenProvider>
    </LocalStoreProvider>
  );
}
