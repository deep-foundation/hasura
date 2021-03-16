const path = require('path');

require('dotenv').config();
const Dotenv = require('dotenv-webpack');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  basePath: isProd ? '/store' : '',
  assetPrefix: isProd ? 'https://cdn.statically.io/gh/deepcase/hasura/gh-pages/' : '',
  future: { webpack5: true },
  webpack: config => {
    config.plugins = [
      ...(config.plugins || []),
      new Dotenv({ path: path.join(__dirname, '.env'), systemvars: true }),
    ];
    return config;
  },
};
