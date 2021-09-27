/**
 * In android env, js Bridge has some trouble:
 *  1. The android api function must call with it's environment object, in other words,
 *    if i use the expression to find the api function, when we call the function it will throw error
 *  2. When the api which is support by android and not arguments, we use rest param and spread operator to
 *  call the api, it throw error
 */

import { isIos } from "./env.js";

const TIME_OUT = 30000;

const g = window;

const ANDROID_PREFIX = "MallJs";

const IS_IOS = isIos();

export const api = {
  0: "prepareToBuyGoods",
  1: "readyToGetGoodsDetailToken",
  2: "getOrderReq",
  3: "showPic",
  4: "getOrderReqSucc",
  5: "addMyShopCart",
  7: "switchReminderStatus",
  8: "scrollObserve",
  9: "goConcat",
  10: "readyToGetRechargeToken",
  11: "prepareToBuyRechargeGoods",
  12: "getConcatFromAddressBooks",
};
// const androidApi = {
//   0: "MallJs.prepareToBuyGoods",
//   1: "MallJs.readyToGetGoodsDetailToken",
//   2: "MallJs.getOrderReq"
// };

function genGlobalUnionName() {
  function createName() {
    let use = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRESUVWXSZ";
    let useArr = use.split("");
    let len = 6;
    let counter = 0;
    let result = "__";
    while (counter < len) {
      // prettier-ignore
      let random = parseInt((Math.random() * useArr.length) - 1);
      result += useArr[random];
      counter++;
    }
    return result;
  }
  let fnName;
  do {
    fnName = createName();
  } while (g[fnName]);
  return fnName;
}

/**
 * in android, we call the result it throw error;
 */
// function getFn(exp) {
//   var exps = exp.split(".");
//   var result = g;
//   exps.every(item => {
//     return !!(result = result[item] ? result[item] : undefined);
//   });
//   return result;
// }

function register({ name, handler }) {
  // 挂载全局钩子
  g[name] = handler;
}

function destroy(name) {
  return delete g[name];
}

/**
 * generate a async call
 */
function genAsync({ globalName }) {
  return new Promise((res, rej) => {
    let timer;
    timer = g.setTimeout(function () {
      destroy(globalName);
      rej(new Error("timeout"));
    }, TIME_OUT);

    register({
      name: globalName,
      handler: function (...args) {
        clearTimeout(timer);
        destroy(globalName);
        res(args);
      }
    });
  });
}

class Bridge {
  api;
  env = IS_IOS ? g : g[ANDROID_PREFIX];
  readyHandlerList = [];
  nativeCallGlobalName = genGlobalUnionName();
  nativeCallObj = (window[this.nativeCallGlobalName] = {});
  isAppReady;
  constructor({ api }) {
    this.api = api;
    // __isJxlready use of web not ready (not create jxlready methods) but app is ready
    this.isAppReady = window.__isJxlready || this.__isAppAllReady();
    /**
     * This methods call is use to provide a global js callback that  natives  notify web
     * as soon as they are ready when web is ready but  natives are not yet.
     */
    register({
      name: "jxlready",
      handler: () => {
        // in url back, it maybe is ready
        if (!this.isAppReady) {
          this.isAppReady = true;
          // refresh the env
          this.env = IS_IOS ? g : g[ANDROID_PREFIX];

          this.readyHandlerList.forEach(item => item && item());
          this.readyHandlerList.length = 0;
        }
      }
    });
  }
  __isAppAllReady() {
    let api = this.api;
    return Object.values(api).every(apiName => this.env && this.env[apiName]);
  }

  addNativeCall(fnName, fn) {
    this.nativeCallObj[fnName] = fn;
    return () => delete this.nativeCallObj[fnName];
  }

  readyPromisify() {
    return new Promise(resolve =>
      this.isAppReady
        ? resolve(true)
        : this.readyHandlerList.push(resolve.bind(null, true))
    );
  }

  ready(readyHandler) {
    if (!this.isAppReady) {
      this.readyHandlerList.push(readyHandler);
    } else {
      readyHandler && readyHandler();
    }
  }
  /**
   * use rest params and spread operator can not call in android
   * todo: whyyy ??
   */
  prepareToBuyGoods(options) {
    this.env[this.api[0]] && this.env[this.api[0]](JSON.stringify(options));
  }
  getGoodsDetailToken() {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    this.env[this.api[1]] && this.env[this.api[1]](globalName);
    return pm;
  }
  getOrderReq(data) {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    if (IS_IOS) {
      let str = JSON.stringify({data: data, callbackName: globalName});
      window.webkit && window.webkit.messageHandlers[this.api[2]] && window.webkit.messageHandlers[this.api[2]].postMessage(str);
    } else {
      this.env[this.api[2]] && this.env[this.api[2]](data, globalName);
    } 
    return pm;
  }
  showPic({ list, current }) {
    if (!Array.isArray(list) || (current < 0 || current >= list.length)) {
      return;
    }
    this.env[this.api[3]]
      && this.env[this.api[3]](
        JSON.stringify({
          list: list,
          current: current
        })
      );
  }
  addMyShopCart(options) {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    this.env[this.api[5]]
      && this.env[this.api[5]](JSON.stringify({ ...options, globalName }));
    return pm;
  }
  switchReminderStatus(options) {
    this.env[this.api[7]] && this.env[this.api[7]](JSON.stringify(options));
  }
  scrollObserve(scrollTop) {
    this.env[this.api[8]] && this.env[this.api[8]](scrollTop);
  }
  goConcat(options) {
    this.env[this.api[9]] && this.env[this.api[9]](JSON.stringify(options));
  }
  getRechargeToken() {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    this.env[this.api[10]] && this.env[this.api[10]](globalName);
    return pm;
  }
  prepareToBuyRechargeGoods(options) {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    this.env[this.api[11]]
      && this.env[this.api[11]](globalName, JSON.stringify(options));
    return pm;
  }
  getConcatFromAddressBooks() {
    let globalName = genGlobalUnionName();
    let pm = genAsync({ globalName });
    if (IS_IOS) {
      window.webkit && window.webkit.messageHandlers[this.api[12]] && window.webkit.messageHandlers[this.api[12]].postMessage(globalName);
    } else {
      this.env[this.api[12]] && this.env[this.api[12]](globalName);
    }
    return pm;
  }
}

export default new Bridge({
  api: api
});
