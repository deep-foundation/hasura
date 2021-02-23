import { HasuraApi } from '@deepcase/hasura/api';

const api = new HasuraApi({
  path: 'localhost:8080',
  ssl: false,
  secret: 'myadminsecretkey'
});

export const up = async () => {
  await api.query({
    type: 'add_remote_schema',
    args: {
      name: 'hasura_example_auth_test',
      definition: {
          url: 'http://dockerhost:3001/api/auth/test-rs',
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
      name: 'hasura_example_auth_test',
    },
  });
};
