# multi-vue
vue多页打包插件（原始的vue项目只可将项目打包成一个html页面，即所谓的单页，使用该脚本后可将项目按照模块打包成多个html页面）

### npm 安装

  npm install https://github.com/kinginconntry/multi-vue.git --save-dev

### 配置

1 在项目新建配置文件，例如开发模式下新建dev.js
2 增加配置

```node
    const builder = require("vue-multi");
    module.exports = builder.dev({
        context: __dirname,
        modules: {
            web: {},
            app: {}
        },
        server: {
            target: 'http://localhost:12000',
            extra: ['api']
        }
    })
```

3 在package.json文件scripts下增加如下命令，运行npm run dev，启动配置

  "dev": "webpack-dev-server --inline --progress --config dev.js --hot --host 0.0.0.0",

4 访问，hash模式下访问admin模块下的home路径

  http://0.0.0.0:8080/admin#home
