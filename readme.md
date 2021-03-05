# deepcase hasura example

[![develop deepcase](https://badgen.net/badge/develop/deepcase)](https://github.com/deepcase/deepcase)

## install

```
npm i
```

Create `.env` file:
```sh
MIGRATIONS_HASURA_PATH=localhost:8080
MIGRATIONS_HASURA_SSL=0
MIGRATIONS_HASURA_SECRET=myadminsecretkey
MIGRATIONS_EXAMPLE_URL=ACCESSABLE_PUBLIC_URL
HASURA_PATH=localhost:8080
HASURA_SSL=0
PORT=3001
```

## settings

```js
// next.config.js
const path = require('path');

require('dotenv').config();
const Dotenv = require('dotenv-webpack');

module.exports = {
  webpack: config => {
    config.plugins = [
      ...(config.plugins || []),
      new Dotenv({ path: path.join(__dirname, '.env'), systemvars: true }),
    ];
    return config;
  },
};
```