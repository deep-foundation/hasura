import { HasuraApi } from '@deepcase/hasura/api';
import { generateApolloClient } from '@deepcase/hasura/client';
import { sql } from '@deepcase/hasura/sql';
import { NODES, INSERT_NODES, UPDATE_NODES, DELETE_NODES } from '../imports/gql';
import { SCHEMA, GRAPH_TABLE, api, permissions } from './1615037349535-nodes';

const client = generateApolloClient({
  path: process.env.MIGRATIONS_HASURA_PATH,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

const TYPES_TABLE = 'hasura_example_types';

export const up = async () => {
  await api.sql(sql`
    CREATE TABLE ${SCHEMA}."${TYPES_TABLE}" (id integer, node_id integer, key text, version text);
    CREATE SEQUENCE ${TYPES_TABLE}_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    ALTER SEQUENCE ${TYPES_TABLE}_id_seq OWNED BY ${SCHEMA}."${TYPES_TABLE}".id;
    ALTER TABLE ONLY ${SCHEMA}."${TYPES_TABLE}" ALTER COLUMN id SET DEFAULT nextval('${TYPES_TABLE}_id_seq'::regclass);
  `);
  await api.query({
    type: 'track_table',
    args: {
      schema: SCHEMA,
      name: TYPES_TABLE,
    },
  });
};

export const down = async () => {
  await api.query({
    type: 'untrack_table',
    args: {
      table: {
        schema: SCHEMA,
        name: TYPES_TABLE,
      },
    },
  });
  await api.sql(sql`
    DROP TABLE ${SCHEMA}."${TYPES_TABLE}";
  `);
};
