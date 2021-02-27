# deepcase hasura example

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