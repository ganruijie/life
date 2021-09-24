let baseConf = require("./jest.conf.js");

module.exports = Object.assign({}, baseConf, {
  coverageDirectory: baseConf.coverageDirectory + "/ios",
  testEnvironmentOptions: {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 XLMessenger/1.4.7 NetType/WIFI Language/zh_CN jest/ios",
  },
  globals: {
    __JE: "ios"
  }
});