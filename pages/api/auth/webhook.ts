import { generateAuthWebhookNextjs } from '@deepcase/hasura/auth-webhook';
import { generateApolloClient } from '@deepcase/hasura/client';
import { gql } from 'graphql-tag';

const client = generateApolloClient({
  client: 'hasura-example-api-auth-webhook',
  path: `${process.env.MIGRATIONS_HASURA_PATH}/v1/graphql`,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
  ws: false,
});

export const USER_BY_TOKEN = gql`query USER_BY_TOKEN($token: String) {
  users:hasura_example_auth_users(where: {tokens: {token: {_eq: $token}}}) {
    id
    role
    tokens {
      id
      token
    }
  }
}`;

export const INSERT_USER = gql`mutation INSERT_USER($token: String) {
  inserted:insert_hasura_example_auth_users_one(object: {role: "guest", tokens: {data: { token: $token }}}) {
    id
    role
    tokens {
      id
      token
    }
  }
}`;

export default generateAuthWebhookNextjs({
  findUserByToken: async (token) => {
    const users = await client.query({
      query: USER_BY_TOKEN,
      variables: { token },
      errorPolicy: 'none',
    });
    const user = users?.data?.users?.[0];
    if (user) {
      return {
        'X-Hasura-Role': user.role,
        'X-Hasura-User-Id': `${user.id}`,
      };
    } else {
      const inserted = await client.mutate({
        mutation: INSERT_USER,
        variables: { token },
        errorPolicy: 'none',
      });
      const user = inserted?.data?.inserted;
      return {
        'X-Hasura-Role': user.role,
        'X-Hasura-User-Id': `${user.id}`,
      };
    }
  },
});
