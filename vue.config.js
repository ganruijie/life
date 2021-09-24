/**
 *   编辑器需要webpack配置文件用 node_modules\@vue\cli-service\webpack.config.js
 */

const path = require("path");
const { getNoEntryPages, getPages } = require("./build");
const {
  HTMLMinifierOptions: minify,
  CspHtmlWebpackPluginOptions: cspOptions
} = require("./build/config");
const { isProd } = require("./build/utils");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");
const vConsolePlugin = require("vconsole-webpack-plugin"); 

const htmlFolder = path.resolve("./src/html");
const entriesFolder = path.resolve("./src/entry");
const htmlPluginOptsArr = getNoEntryPages(entriesFolder, htmlFolder);
const pages = getPages(entriesFolder, htmlFolder);

module.exports = {
  publicPath: isProd ? "/h5/" : "",
  pages: {
    ...pages
  },
  assetsDir: "static",
  css: {
    sourceMap: true
  },
  transpileDependencies: ["swiper", "dom7"],
  devServer: {
    port: 8502,
    proxy: {
      //  联系客服
      "/cnc": {
        target: process.env.PROXY_XIANLIAO_ABOUT_API,
        changeOrigin: true
      },
      //充值
      "/webgw": {
        target: process.env.PROXY_API,
        changeOrigin: true
      }
    },
    allowedHosts: ["47.241.59.240"]
  },
  configureWebpack: {
    plugins: [
      new vConsolePlugin({
        filter: [],     // 需要过滤的入口文件
        enable: !isProd      // 生产环境不打开
      })
    ]
  },
  chainWebpack(config) {
    //配置extract-css-loader，使其使用的公路径为publicPath: "/h5/",使用webpack的publicPath
    isProd
      && ["css", "less", "scss", "sass", "stylus"].forEach(fileType => {
        const rule = config.module.rule(fileType);
        ["vue-modules", "vue", "normal-modules", "normal"].forEach(type => {
          rule
            .oneOf(type)
            .use("extract-css-loader")
            .loader(require("mini-css-extract-plugin").loader)
            .tap(options => ({ ...options, publicPath: undefined }));
        });
      });

    //配置style-resource,给每个less文件和vue文件增加全局变量和mixin
    ["vue-modules", "vue", "normal-modules", "normal"]
      .reduce((rule, type) => {
        return rule
          .oneOf(type)
          .use("style-resource")
          .loader("style-resources-loader")
          .options({
            patterns: [
              path.resolve(__dirname, "./src/styles/mixins/index.less"),
              path.resolve(__dirname, "./src/styles/variable.less")
            ]
          })
          .end()
          .end();
      }, config.module.rule("less"))
      .end()
      .end()

      //TODO: It's a mess here , needs to be reorganized.
      .module.rule("html")
      .test(/(?<!src[\\/]html[\\/].*)\.html$/)
      .use("html-loader")
      .loader("html-loader")
      .options({
        interpolate: true,
        ...(isProd ? minify : null)
      })
      .end()
      .end()
      .end()
      /*
      对.ejs文件的处理,只对非src/html下的文件有效。
      引入后需要执行才能获得字符串
      如:
      import  template from "template.html"
      const html = template();
      引用静态资源有两种方式:
      1.在lodash插值中用require()引用，可以使用webpack alias
      2.通过html-loader对静态资源的链接进行转换，本质也是变为require(),但是无法使用webpack alias
      */
      .module.rule("ejs")
      .test(/(?<!src[\\/]html[\\/].*)\.ejs$/)
      //使用ejs-loader处理模板中的lodash插值
      .use("ejs-loader")
      .loader("ejs-loader")
      .end()
      .use("extract-loader")
      .loader("extract-loader")
      .end()
      //对模板进行压缩，处理文件中对静态资源的引用,不可使用webpack alias
      .use("html-loader")
      .loader("html-loader")
      .options({
        ...(isProd ? minify : null)
      });

    //optimization优化
    isProd
      && config.optimization
        .runtimeChunk("single")
        .splitChunks({
          minChunks: 2,
          minSize: 0,
          cacheGroups: {
            vendors: {
              name: "vendors",
              test: /[\\\/]node_modules[\\\/]/,
              priority: -10,
              chunks: "all"
            },
            common: {
              name: "common",
              test: /[\\\/]src[\\\/](?!documents)/,
              priority: -20,
              chunks: "all",
              reuseExistingChunk: true
            }
          }
        })
        .end();

    /*
    修改html-webpack-plugin配置项
    html-webpack-plugin默认使用lodash.template作为模板引擎
    * 在html-webpack-plugin的html模板中引用静态资源有一种方式:
      1.在lodash插值中用require()引用，可以使用webpack alias
   */
    isProd
      && Object.keys(pages).forEach(entryName => {
        config.plugin(`html-${entryName}`).tap(options => {
          options[0].minify = minify;
          return options;
        });
      });
    //没有入口的html
    htmlPluginOptsArr.forEach(htmlPluginOpts => {
      const { filename } = htmlPluginOpts;
      htmlPluginOpts = isProd ? { ...htmlPluginOpts, minify } : htmlPluginOpts;
      config
        .plugin(`html-${filename.replace(".html", "")}`)
        .use(HtmlWebpackPlugin, [htmlPluginOpts])
        //必须在所有preload插件之前增加此插件，才能使所有preload插件配置生效。
        .before(`preload-${Object.keys(pages)[0]}`);
    });

    isProd && config.plugin("csp-html-webpack-plugin").use(
      CspHtmlWebpackPlugin,
      [...cspOptions]
    ).after(`html-${htmlPluginOptsArr.slice(-1)[0].filename.replace(".html", "")}`);
  }
};
