const HTMLMinifierOptions = {
  minimize: true,
  minifyJS: true,
  minifyCSS: true,
  removeComments: true,
  collapseWhitespace: true,
  removeAttributeQuotes: true,
  collapseBooleanAttributes: true,
  removeScriptTypeAttributes: true
};
/*
由于cps2只在ios 10和android 5.0以上才支持.
所以通过增加nonce或hash来使用内联脚本的方法不起作用,
需要禁止hash和nonce，否则浏览器禁止执行。
内容安全政策: 
  1.script-src脚本: 
    ①同源脚本 
    ②内联脚本
  2.child-src 工作线程和iframe 
    不允许
  3.object-src Flash 和其他插件
    不允许
  4.worker-src 工作线程 web-worker
  允许使用同源
  5.style-src 样式
    ①同源样式表
    ②内联样式表(包括<style></style>和标签的style属性)
* */
//插件默认配置请看https://github.com/slackhq/csp-html-webpack-plugin
const CspHtmlWebpackPluginOptions = [
  {
    "base-uri": "'self'",
    "object-src": "'none'",
    "child-src": "'none'",
    "worker-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "script-src": ["'self'", "'unsafe-inline'"]
  },
  {
    enabled: true,
    hashingMethod: "sha256",
    hashEnabled: {
      "script-src": false,
      "style-src": false
    },
    nonceEnabled: {
      "script-src": false,
      "style-src": false
    }
  }
];

module.exports = {
  HTMLMinifierOptions,
  CspHtmlWebpackPluginOptions
};