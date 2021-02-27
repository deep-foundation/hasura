import { HasuraApi } from '@deepcase/hasura/api';
import { sql } from '@deepcase/hasura/sql';

const api = new HasuraApi({
  path: process.env.MIGRATIONS_HASURA_PATH,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

export const up = async () => {
  await api.sql(sql`
    CREATE TABLE public.hasura_example_auth_users (id integer);
    CREATE SEQUENCE hasura_example_auth_users_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER SEQUENCE hasura_example_auth_users_id_seq OWNED BY public.hasura_example_auth_users.id;
    ALTER TABLE ONLY public.hasura_example_auth_users ALTER COLUMN id SET DEFAULT nextval('hasura_example_auth_users_id_seq'::regclass);
  `);
  await api.query({
    type: 'track_table',
    args: {
      schema: 'public',
      name: 'hasura_example_auth_users',
    },
  });
};

export const down = async () => {
  await api.query({
    type: 'untrack_table',
    args: {
      table: {
        schema: 'public',
        name: 'hasura_example_auth_users',
      },
    },
  });
  await api.sql(sql`
    DROP TABLE hasura_example_auth_users;
  `);
};
