'use strict'
const utils = require('./utils');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpack = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const portfinder = require('portfinder')
const multiHelper = require("./multi-helper");


const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

function mergeConfig(baseConfig) {
    return merge(baseConfig, {
        module: {
            rules: utils.styleLoaders({sourceMap: true, usePostCSS: true})
        },
        devtool: 'cheap-module-eval-source-map',
        devServer: {
            clientLogLevel: 'warning',
            historyApiFallback: {},
            hot: true,
            contentBase: false,
            compress: true,
            host: HOST || 'localhost',
            port: PORT || 8080,
            open: false,
            overlay: {warnings: true, errors: true, debug: true, info: true},
            publicPath: '/',
            proxy: {},
            quiet: true,
            watchOptions: {
                poll: false,
            }
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"development"'
                }
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NamedModulesPlugin(),
            new webpack.NoEmitOnErrorsPlugin(),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                jquery: "jquery",
                "window.jQuery": "jquery"
            })

        ]
    })
}


function init(devWebpackConfig, config) {

    let modules = config.modules;
    let entries = multiHelper.getEntries(devWebpackConfig.context, modules);
    devWebpackConfig.entry = entries;
    let htmls = multiHelper.getHtmlWebpackPluginConfig(devWebpackConfig.context, modules);
    htmls.forEach((html) => {
        devWebpackConfig.plugins.push(new HtmlWebpackPlugin(html));
    })

    if (config.staticDir) {
        devWebpackConfig.plugins.push(new CopyWebpackPlugin([
            {
                from: config.staticDir,
                to: path.resolve(utils.constants.DEFAULT_COMPILE, utils.constants.DEFAULT_STATIC),
                ignore: ['.*']
            }
        ]));
    }

    let rewrites = multiHelper.getRewrites(devWebpackConfig.context, modules);
    devWebpackConfig.devServer.historyApiFallback.rewrites = rewrites;

    let server = config.server;
    if (server.host) {
        devWebpackConfig.devServer.host = server.host;
    }
    if (server.port) {
        devWebpackConfig.devServer.port = server.port;
    }
    // TODO 这里还需要配置api代理
    let proxies = multiHelper.getProxy(modules, server.target, server.pass, server.extra);
    devWebpackConfig.devServer.proxy = proxies;

}


module.exports.getConfig = function (config) {
    let baseConfig = baseWebpack.getConfig(config, false);
    let devWebpackConfig = mergeConfig(baseConfig);
    init(devWebpackConfig, config);

    return new Promise((resolve, reject) => {
        console.log(portfinder);
        portfinder.basePort = devWebpackConfig.devServer.port
        portfinder.getPort((err, port) => {
            if (err) {
                reject(err)
            } else {
                process.env.PORT = port
                devWebpackConfig.devServer.port = port
                devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                    compilationSuccessInfo: {
                        messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                    },
                    onErrors: utils.createNotifierCallback()
                }))

                resolve(devWebpackConfig)
            }
        })
    })
}
