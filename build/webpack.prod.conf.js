'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpack = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const multiHelper = require("./multi-helper");


function mergeConfig(baseConfig) {
  let webpackConfig = merge(baseConfig, {
    module: {
      rules: utils.styleLoaders({
        sourceMap: true,
        extract: true,
        usePostCSS: true
      })
    },
    devtool: '#source-map',
    output: {
      filename: path.posix.join('[name]', utils.constants.DEFAULT_STATIC, 'js', '[name].[chunkhash].js'),
      chunkFilename: path.posix.join('[name]', utils.constants.DEFAULT_STATIC, 'js', '[id].[chunkhash].js')
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false
          }
        },
        sourceMap: true,
        parallel: true
      }),
      new ExtractTextPlugin({
        filename: path.posix.join('[name]', utils.constants.DEFAULT_STATIC, 'css/[name].[contenthash].css'),
        allChunks: true,
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {safe: true, map: {inline: false}}
      }),
      new webpack.HashedModuleIdsPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks(module) {
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(
              path.join(baseConfig.context, './node_modules')
            ) === 0
          )
        }
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        minChunks: Infinity
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: 'app',
        async: 'vendor-async',
        children: true,
        minChunks: 3
      }),
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        jquery: "jquery",
        "window.jQuery": "jquery"
      })
    ]
  })

  if (false) {
    const CompressionWebpackPlugin = require('compression-webpack-plugin');

    webpackConfig.plugins.push(
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(
          '\\.(' +
          ['js', 'css'].join('|') +
          ')$'
        ),
        threshold: 10240,
        minRatio: 0.8
      })
    )
  }

  if (process.env.npm_config_report) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
  }
  return webpackConfig;
}

module.exports.getConfig = function (config) {
  let baseConfig = baseWebpack.getConfig(config, true);
  let webpackConfig = mergeConfig(baseConfig);
  let modules = config.modules;
  let entries = multiHelper.getEntries(baseConfig.context, modules);
  webpackConfig.entry = entries;
  let htmls = multiHelper.getHtmlWebpackPluginConfig(baseConfig.context, modules, true);
  htmls.forEach((html) => {
    webpackConfig.plugins.push(new HtmlWebpackPlugin(html));
  })
  if (config.staticDir) {
    webpackConfig.plugins.push(new CopyWebpackPlugin([
      {
        from: config.staticDir,
        to: path.resolve(utils.constants.DEFAULT_COMPILE, utils.constants.DEFAULT_STATIC),
        ignore: ['.*']
      }
    ]));
  }
  return webpackConfig;
}
