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
  path: 'hasura.domain.com', // link to hasura location
  headers: {}, // custom additional fields into headers
  initialStore: {},
});
client.query({ query: gql`{ links { id }}` }).then(result => console.log(result))
```
