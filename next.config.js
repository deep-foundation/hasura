const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  basePath: isProd ? '/store' : '',
  assetPrefix: isProd ? 'https://cdn.statically.io/gh/deepcase/hasura/gh-pages/' : '',
};
