import { HasuraApi } from '@deepcase/hasura/api';

const api = new HasuraApi({
  path: process.env.MIGRATIONS_HASURA_PATH,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

console.log(`${process.env.MIGRATIONS_EXAMPLE_URL}/api/auth/jwt`);

export const up = async () => {
  await api.query({
    type: 'add_remote_schema',
    args: {
      name: 'hasura_example_auth_jwt',
      definition: {
        url: `${process.env.MIGRATIONS_EXAMPLE_URL}/api/auth/jwt`,
        headers: [{ name: 'x-hasura-client', value: 'hasura-example' }],
        forward_client_headers: true,
        timeout_seconds: 60
      },
    }
  });
};

export const down = async () => {
  await api.query({
    type: 'remove_remote_schema',
    args: {
      name: 'hasura_example_auth_jwt',
    },
  });
};
