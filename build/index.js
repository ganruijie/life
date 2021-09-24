const { getEntries, getHTMLTemplates } = require("./utils");
const path = require("path");
const chalk = require("chalk");
const { warn } = require("@vue/cli-shared-utils");

/**
 * 生成vue.config.js pages属性的多页配置,
 * 入口文件与html模板文件的路径必须一一对应 如 /html/b/a.ejs 对应/js/b/a.js。
 * @param entriesFolder [string:path] 入口文件目录
 * @param htmlsFolder [string:path]  html模板文件目录
 *
 */
const getPages = function (entriesFolder, htmlsFolder) {
  const entries = getEntries(entriesFolder);
  const templates = getHTMLTemplates(htmlsFolder);
  const reg = /(?<entryName>.*?(?<jsFilename>[^\\/]+)(?=\.js))/;
  return entries.reduce((pages, entryRelative) => {
    const {
      groups,
      groups: { entryName, jsFilename }
    } = reg.exec(entryRelative);
    const templateRelative = templates.find(item => {
      return new RegExp("^" + entryName + "\\.(ejs|html)").test(item);
    });
    if (!templateRelative) {
      warn(chalk.cyan(`${path.posix.join(entryRelative)} 没有对应的HTML模板.`));
      return pages;
    }
    const template = path.resolve(htmlsFolder, templateRelative);
    const entry = path.resolve(entriesFolder, entryRelative);
    pages[entryName] = {
      entry,
      template,
      filename: path.posix.join(`${entryName}.html`),
      chunks: ["vendors", "common", "runtime", entryName]
    };
    return pages;
  }, {});
};

/**
 * 生成html或ejs模板没有入口文件时，直接用html-webpack-plugin插件生成html文件
 * @param entriesFolder [string:path] 入口文件目录
 * @param htmlsFolder [string:path]  html模板文件目录
 */
const getNoEntryPages = function (entriesFolder, htmlsFolder) {
  const entries = getEntries(entriesFolder);
  const templates = getHTMLTemplates(htmlsFolder);
  return templates
    .filter(templateRelative => {
      const matchEntry = templateRelative.replace(/(html|ejs)/, "js");
      return !entries.includes(matchEntry);
    })
    .map(templateRelative => {
      const filename = path.posix.join(
        templateRelative.replace(/\..*$/, ".html")
      );
      const template = path.resolve(htmlsFolder, templateRelative);
      return {
        filename,
        template,
        chunks: []
      };
    });
};

module.exports = {
  getPages,
  getNoEntryPages
};
