[![npm](https://img.shields.io/npm/v/@deep-foundation/hasura.svg)](https://www.npmjs.com/package/@deep-foundation/hasura)
[![Gitpod](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/deep-foundation/hasura) 
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label&color=purple)](https://discord.gg/deep-foundation)


# Usage
## Library
See [Documentation] for examples and API

## API

```ts
import { HasuraApi } from '@deep-foundation/hasura/api';

const api = new HasuraApi({
  path: 'hasura.domain.com',
  ssl: true,
  secret: 'adminsecretkey'
});
```

> sql template literal for ide highlighting
```ts
import { sql } from '@deep-foundation/hasura/sql';

await api.sql(sql`SELECT * FROM mytable`);
```

[hasura api reference](https://hasura.io/docs/1.0/graphql/core/api-reference/schema-metadata-api/index.html)
```ts
await api.query({
  type: 'track_table',
  args: {
    schema: 'public',
    name: 'mytable',
  }
});
```

## Client
```ts
import { generateApolloClient } from '@deep-foundation/hasura/client';
import gql from 'graphql-tag';
const client = generateApolloClient({ // all options are optional
  ws: true, // need to socket for subscriptions // recommended
  secret: 'adminSecretForRoot', // admin secret for root access // not need when token exists
  token: 'tokenFromCookiesOrLocalStorage', // token for auth webhook auth // ignored when secret exists
  ssl: true; // auto http/https ws/wss protocol
  path: 'hasura.domain.com/path', // link to hasura location
  headers: {}, // custom additional fields into headers
  initialStore: {},
  relative: false, // optional
});
client.query({ query: gql`{ links { id }}` }).then(result => console.log(result))
```

If you need to specify an absolute path as `protocol://domain.zone/path` to hasura, you **must** pass these two options: `path` and `ssl`

```ts
const client = generateApolloClient({ // all options are optional
  ssl: true;
  path: 'hasura.domain.com/path',
});
```

If you need to specify relative path as `/path` to hasura, you must enable the relative mode with the `relative` option. In this case, the `ssl` option is ignored in `http` client, but used in `ws`. This can be useful when your build is with some proxy.

```ts
const client = generateApolloClient({ // all options are optional
  relative: true,
  path: 'hasura.domain.com/path',
});
```

You can also specify relative not locally in your code, but using an ENV variable `DEEP_FOUNDATION_HASURA_RELATIVE` or `NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE`.

```sh
export DEEP_FOUNDATION_HASURA_RELATIVE = 1;
```
OR
```sh
export NEXT_PUBLIC_DEEP_FOUNDATION_HASURA_RELATIVE = 1;
```

## Dignostics

### PostgreSQL

#### Get PostgreSQL logs:

```sh
docker logs deep-postgres
```

#### Connect to PostgreSQL from inside its docker container:

```sh
docker exec -it deep-postgres bash
su postgres
psql
```

#### Get the size of all tables in the databases and indexes:
```sql
SELECT
  nspname                                               AS "schema",
  pg_class.relname                                      AS "table",
  pg_size_pretty(pg_total_relation_size(pg_class.oid))  AS "total_size",
  pg_size_pretty(pg_relation_size(pg_class.oid))        AS "data_size",
  pg_size_pretty(pg_indexes_size(pg_class.oid))         AS "index_size",
  pg_stat_user_tables.n_live_tup                        AS "rows",
  pg_size_pretty(
    pg_total_relation_size(pg_class.oid) / 
    (pg_stat_user_tables.n_live_tup + 1)
  )                                                     AS "total_row_size",
  pg_size_pretty(
    pg_relation_size(pg_class.oid) / 
    (pg_stat_user_tables.n_live_tup + 1)
  )                                                     AS "row_size"
FROM 
  pg_stat_user_tables 
JOIN 
  pg_class
ON
  pg_stat_user_tables.relid = pg_class.oid
JOIN 
  pg_catalog.pg_namespace AS ns
ON
  pg_class.relnamespace = ns.oid
ORDER BY 
  pg_total_relation_size(pg_class.oid) DESC;
```

#### Get the list of active queries:

```sql
SELECT datname, pid, state, query, age(clock_timestamp(), query_start) AS age 
FROM pg_stat_activity
WHERE state <> 'idle' 
    AND query NOT LIKE '% FROM pg_stat_activity %' 
ORDER BY age;
```

#### Cancel the query
```sql
SELECT pg_cancel_backend(pid);
```

[Documentation]: https://deep-foundation.github.io/hasura/

## Maintenance

### Refresh package-lock.json

This command deletes `node_modules`, `package-lock.json` and runs `npm i`. So everything is refreshed.

```bash
npm run package:refresh
```

### Release a new version

```bash
npm run package:release
```

After that it might be required to release new versions of:
1. https://github.com/deep-foundation/react-hasura
2. https://github.com/deep-foundation/materialized-path
3. https://github.com/deep-foundation/deeplinks