const fs = require('fs');
const portfinder = require('portfinder');
const webpack = require('webpack');
const {createServer} = require('https');
const createHash = require('crypto').createHash;
const SlateConfig = require('@shopify/slate-config');

const App = require('./app');
const Client = require('./client');
const {sslKeyCert} = require('../utilities');
const setEnvironment = require('../../tools/webpack/set-slate-env');
const config = new SlateConfig(require('../../slate-tools.schema'));

portfinder.basePort = config.get('assetServer.port');

module.exports = class DevServer {
  constructor(options) {
    this.assetHashes = {};
    this.options = options;
    this.env = setEnvironment(options.env);
    this.compiler = webpack(options.webpackConfig);
    this.app = new App(this.compiler);
    this.client = new Client();
    this.client.hooks.afterSync.tap(
      'HotMiddleWare',
      this._onAfterSync.bind(this),
    );
  }

  async start() {
    this.compiler.hooks.done.tapPromise(
      'DevServer',
      this._onCompileDone.bind(this),
    );
    this.ssl = sslKeyCert();
    this.server = createServer(this.ssl, this.app);
    this.port = await portfinder.getPortPromise();

    this.server.listen(this.port);
  }

  set files(files) {
    this.client.files = files;
  }

  set skipDeploy(value) {
    this.client.skipNextSync = value;
  }

  _onCompileDone(stats) {
    const files = this._getChangedLiquidFiles(stats);

    return this.client.sync(files);
  }

  _onAfterSync(files) {
    this.app.webpackHotMiddleware.publish({
      action: 'shopify_upload_finished',
      force: files.length > 0,
    });
  }

  _getChangedLiquidFiles(stats) {
    const assets = Object.entries(stats.compilation.assets);

    return (
      assets
        .filter(([key, asset]) => {
          const oldHash = this.assetHashes[key];
          const newHash = this._updateAssetHash(key, asset);

          return (
            asset.emitted &&
            (/\.liquid$/.test(key) || /\.json$/.test(key)) &&
            fs.existsSync(asset.existsAt) &&
            oldHash !== newHash
          );
        })
        /* eslint-disable-next-line no-unused-vars */
        .map(([key, asset]) => {
          return asset.existsAt.replace(config.get('paths.theme.dist'), '');
        })
    );
  }

  _updateAssetHash(key, asset) {
    const rawSource = asset.source();
    const source = Array.isArray(rawSource) ? rawSource.join('\n') : rawSource;
    const hash = createHash('sha256')
      .update(source)
      .digest('hex');

    return (this.assetHashes[key] = hash);
  }
};
