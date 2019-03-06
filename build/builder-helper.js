const devWebpack = require("./webpack.dev.conf");
const prodWebpack = require("./webpack.prod.conf");
const builder = require("./build");

module.exports = {
  dev(config){
    return devWebpack.getConfig(config);
  },
  prod(config){
    return prodWebpack.getConfig(config);
  },
  build(config){
    builder.build(config);
  }
}
