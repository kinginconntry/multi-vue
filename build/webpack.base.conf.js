'use strict'
const path = require('path')
const utils = require('./utils')


module.exports.getConfig = function (config, isProduct) {
  if (!config) {
    console.error("webpack配置信息不存在");
    return false;
  }
  if (!config.context) {
    console.error("webpack上下文信息不存在");
    return false;
  }
  let context = path.resolve(config.context, './');

  function resolve(dir) {
    return path.resolve(context, dir)
  }

  return {
    context: context,
    entry: {},
    output: {
      path: path.resolve(context, utils.constants.DEFAULT_COMPILE),
      filename: '[name].js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve(utils.constants.DEFAULT_SRC),
        'module': path.resolve(utils.constants.DEFAULT_SRC, utils.constants.DEFAULT_PATH_SUFFIX),
        'jquery': 'jquery'
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            loaders: utils.cssLoaders({
              sourceMap: true,
              extract: isProduct
            }),
            cssSourceMap: true,
            cacheBusting: true,
            transformToRequire: {
              video: ['src', 'poster'],
              source: 'src',
              img: 'src',
              image: 'xlink:href'
            }
          }
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve(utils.constants.DEFAULT_SRC)]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: path.posix.join(utils.constants.DEFAULT_STATIC, 'images/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: path.posix.join(utils.constants.DEFAULT_STATIC, 'media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: path.posix.join(utils.constants.DEFAULT_STATIC, 'fonts/[name].[hash:7].[ext]')
          }
        }
      ]
    },
    node: {
      setImmediate: false,
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    }
  }
}
