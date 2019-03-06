const path = require('path');
const constants = require("./utils").constants;

module.exports = {
    getEntries(basePath, modules) {

        let entries = {};
        if (!modules) {
            // 使用根目录下的单页应用
            entries['app'] = path.resolve(constants.DEFAULT_SRC, constants.DEFAULT_ENTRY_JS)
        } else {
            for (let key in modules) {
                entries[key] = path.resolve(constants.DEFAULT_SRC, constants.DEFAULT_PATH_SUFFIX, key, constants.DEFAULT_ENTRY_JS)
            }
        }
        return entries;
    },
    getHtmlWebpackPluginConfig(basePath, modules, isProduct) {
        if (!isProduct) {
            isProduct = false;
        }

        let configs = [];
        if (modules && modules.length !== 0) {
            for (let key in modules) {
                let config = {
                    inject: true,
                    chunks: ['manifest', 'vendor', key]
                };
                if (isProduct) {
                    config.filename = path.resolve(constants.DEFAULT_COMPILE, `${key}.html`);
                    config.template = path.resolve(constants.DEFAULT_SRC, constants.DEFAULT_PATH_SUFFIX, key, constants.DEFAULT_FILENAME);
                    config.minify = {
                        removeComments: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true
                    }
                    config.chunksSortMode = 'dependency'
                } else {
                    config.template = path.resolve(constants.DEFAULT_SRC, constants.DEFAULT_PATH_SUFFIX, key, constants.DEFAULT_FILENAME);
                    config.filename = `${key}.html`;
                }
                if (modules[key]['favicon']) {
                    config['favicon'] = modules[key]['favicon'];
                }
                configs.push(config)
            }
        } else {
            configs.push({
                template: path.resolve(constants.DEFAULT_FILENAME),
                filename: constants.DEFAULT_FILENAME,
                inject: true
            })
        }
        return configs;
    },
    getRewrites(basePath, modules) {
        let rewrites = [];
        if (modules && modules.length !== 0) {
            for (let key in modules) {
                rewrites.push({
                    from: `^/${key}(/)?.*`,
                    to: path.posix.join('/', `${key}.html`)
                })
            }
        } else {
            // 单页应用
            rewrites.push({
                from: '.*',
                to: path.posix.join('/', constants.DEFAULT_FILENAME)
            })
        }
        return rewrites;
    },
    getProxy(modules, server, passProxy, extra){
        let contexts = [];
        let moduleKeys = [];
        for(let key in modules){
            contexts.push(`/${key}`);
            moduleKeys.push(`/${key}`);
        }

        if(extra){
            for(let index in extra){
                contexts.push(`/${extra[index]}`)
            }
        }
        return [{
            context: contexts,
            target: server,
            bypass: function(req, res, proxyOptions) {
                if (moduleKeys.indexOf(req.url) > -1) {
                    return `${req.url}.html`;
                }
                if(extra && extra.indexOf(req.url) > -1){
                    return req.url;
                }else{
                    return false;
                }
            }
        }]
    }
}
