# deepcase hasura

[![npm version](https://badge.fury.io/js/%40deepcase%2Fhasura.svg)](https://badge.fury.io/js/%40deepcase%2Fhasura) [![example](https://badgen.net/badge/example/gh-pages/gray)](https://deepcase.github.io/hasura/) [![develop deepcase](https://badgen.net/badge/develop/deepcase)](https://github.com/deepcase/deepcase)

## api

```ts
import { HasuraApi } from '@deepcase/hasura/api';

const api = new HasuraApi({
  path: 'hasura.domain.com',
  ssl: true,
  secret: 'adminsecretkey'
});
```

> sql template literal for ide highlighting
```ts
import { sql } from '@deepcase/hasura/sql';

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

## client
```ts
import { generateApolloClient } from '@deepcase/hasura/client';
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

If you need to specify relative path as `/path` to hasura, you must enable the relative mode with the `relative` option. In this case, the `ssl` option is ignored. This can be useful when your build is with some proxy.

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