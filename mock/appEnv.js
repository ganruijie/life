/**
 * 模拟app下环境的的提供虚假的app接口
 */
import * as log from "./log.js";
const g = window;

log.debug("environment variables", process.env);

const mockData = {
  detailToken:
    "48%2BdJIltE00%2F34FnueiZg4UI9uGi%2B2ZJOc8z0uE1M%2FWwyDft31JgN5x9bhlP8y52UwdEO2qVFrXtnwmhAB6djqJ4yYgmtI4ptJPq6IpwSQ8%2FYHnmt3581T1Bcnd47mVPTYXc2P5r8WbZlW1Am%2B7AWfJEfe%2F5HwblrEZu1%2FQLoiRpchYk8ZJPHD9J9r2q%2BpdH2Ko%2BpXqCmS1J9U6z9fbLsR%2Fncl5YC6bymfD4vExYKKOc%3D",
  feeListToken:
    "48%2BdJIltE00%2F34FnueiZg4UI9uGi%2B2ZJOc8z0uE1M%2FWwyDft31JgN5x9bhlP8y52UwdEO2qVFrXtnwmhAB6djqJ4yYgmtI4ptJPq6IpwSQ8%2FYHnmt3581T1Bcnd47mVPTYXc2P5r8WbZlW1Am%2B7AWfJEfe%2F5HwblrEZu1%2FQLoiRpchYk8ZJPHD9J9r2q%2BpdH2Ko%2BpXqCmS1J9U6z9fbLsR%2Fncl5YC6bymfD4vExYKKOc%3D",
  dataListToken:
    "48%2BdJIltE00%2F34FnueiZg4UI9uGi%2B2ZJOc8z0uE1M%2FWwyDft31JgN5x9bhlP8y52UwdEO2qVFrXtnwmhAB6djqJ4yYgmtI4ptJPq6IpwSQ8%2FYHnmt3581T1Bcnd47mVPTYXc2P5r8WbZlW1Am%2B7AWfJEfe%2F5HwblrEZu1%2FQLoiRpchYk8ZJPHD9J9r2q%2BpdH2Ko%2BpXqCmS1J9U6z9fbLsR%2Fncl5YC6bymfD4vExYKKOc%3D",
  phoneNum: "11111111111",
  concatName: "hehe",
  goodsCountInCart: 0,
  goodsAddingStatus: {
    goodsIsAdd: false,
    removeAble: true
  },
  chargeData: [
    { tabKey: 1, tabName: "MPT", id: 1 },
    { tabKey: 2, tabName: "OORRDOO", id: 2 },
    { tabKey: 3, tabName: "TELENOR", id: 3 },
  ],
  renderData: [
    {goodsVOList: [
      {activityDescption: "", goodsId: 2021091811, amount: 1000000, goodsName: "MPT1", salePrice: 1000000, type: 1, virtualGoodsType: 1},
      {activityDescption: "", goodsId: 2021091812, amount: 2000000, goodsName: "MPT2", salePrice: 1900000, type: 1, virtualGoodsType: 1},
      {activityDescption: "hot", goodsId: 2021091813, amount: 3000000, goodsName: "MPT3", salePrice: 2760000, type: 1, virtualGoodsType: 1},
      {activityDescption: "", goodsId: 2021091814, amount: 5000000, goodsName: "MPT4", salePrice: 4160000, type: 1, virtualGoodsType: 1},
    ], type: 1, title: "Choose Amount"},
    {
      goodsVOList: [
        {activityDescption: "", goodsId: 2021091815, amount: 1200000, goodsName: "Data Shal Thone Package(1GB)", salePrice: 1160000, type: 1, virtualGoodsType: 2},
        {activityDescption: "", goodsId: 2021091816, amount: 2200000, goodsName: "Data Shal Thone Package(3GB)", salePrice: 2160000, type: 1, virtualGoodsType: 2},
        {activityDescption: "", goodsId: 2021091817, amount: 3200000, goodsName: "Data Shal Thone Package(5GB)", salePrice: 4160000, type: 1, virtualGoodsType: 2},
      ], type: 1, title: "Choose Data Package"
    },
    {
      goodsVOList: [
        {activityDescption: "", goodsId: 2021091821, amount: 1000000, goodsName: "OORRDOO1", salePrice: 1100000, type: 2},
        {activityDescption: "", goodsId: 2021091822, amount: 2000000, goodsName: "OORRDOO2", salePrice: 2000000, type: 2},
        {activityDescption: "", goodsId: 2021091823, amount: 3000000, goodsName: "OORRDOO3", salePrice: 2800000, type: 2},
      ],
      type: 2
    },
    {
      goodsVOList: [
        {activityDescption: "", goodsId: 2021091831, amount: 1000000, goodsName: "OORRDOO1", salePrice: 10000000, type: 3},
        {activityDescption: "", goodsId: 2021091832, amount: 2000000, goodsName: "OORRDOO2", salePrice: 1800000, type: 3},
        {activityDescption: "", goodsId: 2021091833, amount: 3000000, goodsName: "OORRDOO3", salePrice: 2809000, type: 3},
        {activityDescption: "", goodsId: 2021091843, amount: 4000000, goodsName: "OORRDOO4", salePrice: 3300000, type: 3},
        {activityDescption: "hot", goodsId: 2021091853, amount: 6000000, goodsName: "OORRDOO5", salePrice: 5420000, type: 3},
      ],
      type: 3
    },
  ]
};

function isIos() {
  return /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent);
}

const initalize = g => {
  var map = {
    readyToGetGoodsDetailToken(name) {
      g[name](
        mockData.detailToken,
        1,
        false,
      /*  encodeURIComponent(JSON.stringify(mockData.goodsAddingStatus))*/
      );
    },
    getOrderReq(data, str) {
      log.debug("getOrderReq", data, str);
    },
    getOrderReqSucc(name, options) {
      return g[name] && g[name](options); ;
    },
    prepareToBuyGoods(options) {
      log.debug("prepareToBuyGoods", JSON.parse(options));
    },
    addOfficeGoods(name) {
      mockData.goodsAddingStatus.goodsIsAdd = !mockData.goodsAddingStatus
        .goodsIsAdd;
      log.debug("addOfficeGoods:" + mockData.goodsAddingStatus.goodsIsAdd);
      setTimeout(() => g[name](), 300);
    },
    showPic(opt) {
      log.debug("showPic:" + opt);
    },
    setShareGoodsInfo(options) {
      log.debug("setShareGoodsInfo", JSON.parse(options));
    },
    getGoodsNumInShopCart(fnPath) {
      log.debug("getGoodsNumInShopCart", fnPath);
      try {
        eval(`${fnPath}(${mockData.goodsCountInCart})`);
      } catch (e) {
        console.error(e);
      }
    },
    switchReminderStatus(options) {
      log.debug("switchReminderStatus", JSON.parse(options));
    },
    scrollObserve(scrollTop) {
      log.debug("scrollObserve", scrollTop);
    },
    goConcat(url) {
      log.debug("goConcat", url);
    },
    readyToGetRechargeToken(name) {
      g[name](mockData.feeListToken, mockData.dataListToken, 2, encodeURIComponent(JSON.stringify({supportGoodType: 7})));
    },
    prepareToBuyRechargeGoods(name, options) {
      g[name](JSON.stringify({ errorCode: 0, errorMessage: "" }));
      log.debug("prepareToBuyRechargeGoods", JSON.parse(options));
    },
    getConcatFromAddressBooks(name) {
      g[name](mockData.phoneNum, mockData.concatName);
      log.debug(
        "getConcatFromAddressBooks",
        mockData.phoneNum,
        mockData.concatName
      );
    },
    // 获取运营商信息
    getChargeData() {
      return new Promise((resolve) => {
        resolve(mockData.chargeData);
      });
    },
    getRechargeToken(name) {
      g[name]();
    },
    getRenderData(type) {
      return new Promise((resolve) => {
        let goodsItemList = mockData.renderData.filter(item => item.type === type);

        resolve({goodsItemList});
      });
    }
  };
  var env = g;
  if (!isIos()) {
    env = g["MallJs"] = {};
  }
  Object.keys(map).forEach(fnname => {
    env[fnname] = map[fnname];
  });
  g.jxlready && g.jxlready();
};

g.addEventListener("load", function () {
  if (!/XLMessenger/i.test(g.navigator.userAgent)) {
    initalize(g);
    log.debug("app env is complete");
  }
});
