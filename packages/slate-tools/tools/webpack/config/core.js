const fs = require('fs');
const webpack = require('webpack');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SlateConfig = require('@shopify/slate-config');

const commonExcludes = require('../common-excludes');
const babelLoader = require('../loaders/babel-loader');
const {entrypointFiles} = require('../entrypoints');
const config = new SlateConfig(require('../../../slate-tools.schema'));

const extractLiquidStyles = new ExtractTextPlugin(
  '[name].styleLiquid.scss.liquid',
);

/**
 * Return an array of ContextReplacementPlugin to use.
 * Omit the __appstatic__ replacement if the directory does not exists.
 *
 * @see https://webpack.js.org/plugins/context-replacement-plugin/#newcontentcallback
 */

function replaceCtxRequest(request) {
  return (context) => Object.assign(context, {request});
}

function contextReplacementPlugins() {
  // Given a request path, return a function that accepts a context and modify it's request.

  const plugins = [
    new webpack.ContextReplacementPlugin(
      /__appsrc__/,
      replaceCtxRequest(config.get('paths.theme.src')),
    ),
  ];

  if (fs.existsSync(config.get('paths.theme.src.static'))) {
    plugins.push(
      new webpack.ContextReplacementPlugin(
        /__appstatic__/,
        replaceCtxRequest(config.get('paths.theme.src.static')),
      ),
    );
  }

  if (fs.existsSync(config.get('paths.theme.src.images'))) {
    plugins.push(
      new webpack.ContextReplacementPlugin(
        /__appimages__/,
        replaceCtxRequest(config.get('paths.theme.src.images')),
      ),
    );
  }

  if (fs.existsSync(config.get('paths.theme.src.fonts'))) {
    plugins.push(
      new webpack.ContextReplacementPlugin(
        /__appfonts__/,
        replaceCtxRequest(config.get('paths.theme.src.fonts')),
      ),
    );
  }

  return plugins;
}

module.exports = {
  context: config.get('paths.theme.src'),

  entry: Object.assign(entrypointFiles(), {
    static: path.resolve(__dirname, 'tools/webpack/static-files-glob.js'),
  }),

  output: {
    filename: '[name].js',
    path: config.get('paths.theme.dist.assets'),
    jsonpFunction: 'shopifySlateJsonp',
  },

  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, 'tools/webpack'),
      path.join(config.get('paths.theme'), 'node_modules'),
    ],
  },

  module: {
    rules: [
      ...babelLoader(),

      {
        test: /\.js$/,
        exclude: commonExcludes(),
        loader: 'hmr-alamo-loader',
      },
      {
        test: /fonts\/.*\.(eot|svg|ttf|woff|woff2)$/,
        exclude: /node_modules/,
        loader: 'file-loader',
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        exclude: commonExcludes(),
        use: [
          {loader: 'file-loader', options: {name: '[name].[ext]'}},
          {loader: 'img-loader'},
        ],
      },
      {
        test: /\.(liquid|json)$/,
        exclude: commonExcludes('assets/styles'),
        loader: 'file-loader',
        options: {
          name: '../[path][name].[ext]',
        },
      },
      {
        test: /assets\/static\//,
        exclude: /node_modules/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
      {
        test: /(css|scss|sass)\.liquid$/,
        exclude: commonExcludes(),
        use: extractLiquidStyles.extract(['concat-style-loader']),
      },
    ],
  },

  plugins: [
    ...contextReplacementPlugins(),

    extractLiquidStyles,

    new CopyWebpackPlugin(
      [
        {
          from: config.get('paths.theme.src.svgs'),
          to: `${config.get('paths.theme.dist.snippets')}/[name].liquid`,
        },
        {
          from: config.get('paths.theme.src.static'),
          to: config.get('paths.theme.dist.assets'),
        },
        {
          from: config.get('paths.theme.src.images'),
          to: config.get('paths.theme.dist.assets'),
        },
        {
          from: config.get('paths.theme.src.fonts'),
          to: config.get('paths.theme.dist.assets'),
        },
        {
          from: config.get('paths.theme.src.locales'),
          to: config.get('paths.theme.dist.locales'),
        },
        {
          from: config.get('paths.theme.src.config'),
          to: config.get('paths.theme.dist.config'),
        },
      ].filter((directory) => fs.existsSync(directory.from)),
    ),

    new WriteFileWebpackPlugin({
      test: /^(?:(?!hot-update.json$).)*\.(liquid|json)$/,
      log: false,
    }),
  ],
};
