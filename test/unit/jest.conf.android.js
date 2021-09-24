let baseConf = require("./jest.conf.js");

module.exports = Object.assign({}, baseConf, {
  coverageDirectory: baseConf.coverageDirectory + "/android",
  testEnvironmentOptions: {
    userAgent: "Mozilla/5.0 (Linux; Android 7.1.2; Redmi 4X Build/N2G47H; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/64.0.3282.137 Mobile Safari/537.36 XLMessenger/1.4.7 NetType/WIFI Language/zh_CN jest/android",
  },
  globals: {
    __JE: "android"
  }
});