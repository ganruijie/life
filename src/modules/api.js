import { genSearchStr } from "./url";
import {code} from "@/config/error.js";
let seq = 0;

function joinParam(param) {
  let paramArr = [];
  if (!param) {
    return "";
  }
  Object.keys(param).forEach(key => {
    paramArr.push(key + "=" + param[key]);
  });
  return paramArr.join("&") || "";
}

export function fetchFn({ url, param, methods = "POST", header }) {
  const err = new Error();
  let paramString = joinParam(param);
  let sendData;
  if (methods.toUpperCase() === "POST" && paramString) {
    sendData = paramString;
  } else if (paramString) {
    url = url + "?" + paramString;
  }
  seq++;
  return (function (seq) {
    return new Promise(function (resolve, reject) {
      let requestObj = new XMLHttpRequest();
      requestObj.seq = seq;
      requestObj.open(methods, url, true);
      requestObj.responseType = "text";
      requestObj.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded"
      );
      //设置传入的header
      if (Object.prototype.isPrototypeOf(header)) {
        for (let [key, value] of Object.entries(header)) {
          requestObj.setRequestHeader(key, value);
        }
      }
      requestObj.addEventListener("readystatechange", function () {
        if (requestObj.readyState < 4) {
          return;
        }
        if (requestObj.status === 200) {
          try {
            let res
              = requestObj.response || requestObj.responseText
                ? JSON.parse(requestObj.response || requestObj.responseText)
                : { errorCode: code.NET_ERR };
            res.seq = seq;
            resolve(res);
          } catch (e) {
            e.errorCode = code.NET_ERR;
            reject(e);
          }
        } else {
          err.errorCode = code.NET_ERR;
          reject(err);
        }
      });
      requestObj.addEventListener("error", function () {
        reject(requestObj);
      });
      requestObj.send(sendData);
    });
  })(seq);
}

export function loadWithScripts({ url, param }) {
  let paramString = joinParam(param);
  if (paramString) {
    url += `&${paramString}`;
  }
  return new Promise(function (resolve, reject) {
    let script = document.createElement("script");
    script.src = url;
    script.onload = function load() {
      resolve();
      document.body.removeChild(script);
    };
    script.onerror = function error(err) {
      reject(err);
    };
    document.body.appendChild(script);
  });
}

/**
 * 一个缓存接口的获取方法，一个类fetchFn接口 要求参数与fetchFn兼容
 * @important 依赖于fetchFn中关于成功/失败的判断
 */
export function getDataWithCache(options) {
  let cacheValue = localStorage.getItem(options.url);
  let currentTime = +new Date();
  cacheValue = cacheValue ? JSON.parse(cacheValue) : false;
  // 没有缓存默认一分钟
  if (!options.cacheTime) {
    options.cacheTime = 1 * 60 * 1000;
  }
  if (
    options.fresh
    || !cacheValue
    || currentTime - cacheValue.cacheTime >= options.cacheTime
  ) {
    // 强制刷新，没有缓存，缓存过期从服务器拉取并重新缓存
    // 此处不使用computeSucc是由与computeSucc会影响结果
    return fetchFn(options).then(res => {
      if (options.isSuccess(res)) {
        localStorage.setItem(
          options.url,
          JSON.stringify({
            ...res,
            cacheTime: +new Date()
          })
        );
      }
      return res;
    });
  } else {
    return Promise.resolve().then(() => {
      return cacheValue;
    });
  }
}

export function computeSucc(api) {
  return function (...args) {
    return api(...args).then(res => {
      if (res.errorCode === 0) {
        return res;
      } else {
        return Promise.reject(res);
      }
    });
  };
}

export const goodsRequest = param => {
  return fetchFn({
    url: "/xmallwebgw/dispatcher",
    param,
    methods: "get"
  });
};

export const spikeGoodsRequest = param => {
  return fetchFn({
    url: process.env.VUE_APP_SPIKE_API + "/xmallspikewebgw/dispatcher",
    param,
    methods: "get"
  });
};

export const getChargeData = param => {
  const requestPlainString = encodeURIComponent(param.requestPlainString);
  param = {
    ...param,
    requestPlainString,
  };
  return fetchFn({
    url: "/xmallvirtualwebgw/dispatcher",
    param,
    methods: "get"
  });
};
// 提交充值订单
export const dispatchRecharge = async (param) => {
  const params = encodeURIComponent(param.params);
  param = {
    ...param,
    params,
  };
  return await fetchFn({
    url: "/webgw/dispatcher",
    param,
    methods: "post"
  });
};

//获取okPay联系客服链接
export const getSupportLink = async ({ openId, token }) => {
  const res = await fetchFn({
    url: process.env.VUE_APP_XIANLIAO_ABOUT_API + "/cnc/getSupportParams",
    param: {
      openId,
      token
    },
    methods: "get",
    header: {
      Accept: "application/json"
    }
  });
  try {
    const {
      supportUrl,
      appId,
      userNickName,
      userAvatarUrl,
      userId,
      signature
    } = JSON.parse(res.data);
    const search = genSearchStr({
      appId,
      userNickName,
      userAvatarUrl,
      userId,
      signature
    });
    return {
      ...res,
      data: `${supportUrl}?${search}`
    };
  } catch (e) {
    return Promise.reject(res);
  }
};

