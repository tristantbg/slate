const config = require('@shopify/slate-tools/slate-tools.schema');

module.exports = (...params) =>
  new RegExp([...config.get('webpack.commonExcludes'), ...params].join('|'));
