const path = require("path");
const glob = require("glob");

const resolve = function (...str) {
  return path.resolve(__dirname, ...str);
};

/**
 * @return {string}
 */
const toPosix = function (pathString) {
  return pathString.split(path.sep).join(path.posix.sep);
};

const getRelativeMap = function (folderPath, globExtensions) {
  let files = glob.sync(folderPath + "/**/*." + globExtensions);
  return files.map(filePath => {
    return path.posix.join(
      ...path.relative(folderPath, filePath).split(path.sep)
    );
  });
};

const getHTMLTemplates = function (htmlsFolder) {
  return getRelativeMap(htmlsFolder, "@(ejs|html)");
};

const getEntries = function (entriesFolder) {
  return getRelativeMap(entriesFolder, "js");
};

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  resolve,
  getHTMLTemplates,
  getEntries,
  isProd,
  toPosix
};
