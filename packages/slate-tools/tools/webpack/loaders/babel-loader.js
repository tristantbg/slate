const fs = require('fs');
const commonExcludes = require('../common-excludes');
const config = new SlateConfig(require('../../../slate-tools.schema'));

module.exports = () => {
  if (
    !fs.existsSync(config.get('babel.configPath')) ||
    !config.get('babel.enable')
  ) {
    return [];
  }

  return [
    {
      test: /\.js$/,
      exclude: commonExcludes(),
      loader: 'babel-loader',
      options: {
        babelrc: false,
        extends: config.get('babel.configPath'),
      },
    },
  ];
};
