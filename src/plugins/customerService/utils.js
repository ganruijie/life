const parseData = data => {
  // 需要防止代理劫持情况
  let sessionList,
    deviceList,
    newData = {};
  if (data) {
    for (let prop in data) {
      if (data.hasOwnProperty(prop)) {
        newData[prop] = data[prop];
      }
    }
    if (data.sessionId) {
      sessionList = data.sessionId.split("||");
      deviceList = data.deviceId.split("||");
      newData.sessionId = sessionList[0];
      newData.deviceId = deviceList[0];
      newData.security = sessionList[1];
    }
  }
  return newData;
};

const joinParam = param => {
  let parseDataParam = parseData(param);
  let paramArr = [];
  if (!parseDataParam) {
    return "";
  }
  Object.keys(parseDataParam).forEach(key => {
    paramArr.push(key + "=" + parseDataParam[key]);
  });
  return paramArr.join("&") || "";
};

const fetchFn = ({ url, param, methods = "POST", header }) => {
  let paramString = joinParam(param);
  let sendData;
  if (methods.toUpperCase() === "POST" && paramString) {
    sendData = paramString;
  } else if (paramString) {
    url = url + "?" + paramString;
  }
  return new Promise(function (resolve, reject) {
    let res,
      err = new Error(),
      requestObj = new XMLHttpRequest();

    // 测试环境，正式环境这个地址不一样
    requestObj.open(methods, url, true);
    requestObj.responseType = "text";
    requestObj.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    requestObj.setRequestHeader("Accept", "application/json");
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
          res
            = requestObj.response || requestObj.responseText
              ? JSON.parse(requestObj.response || requestObj.responseText)
              : { errorCode: "netBreak" };
        } catch (e) {
          res = { errorCode: "netBreak" };
        }
        resolve(res);
      } else {
        err.errorCode = "netBreak";
        err.message = "网络错误，请稍后重试";
        reject(err);
      }
    });
    requestObj.addEventListener("error", function () {
      err.errorCode = "netBreak";
      err.message = "网络错误，请稍后重试";
      reject(err);
    });
    requestObj.send(sendData);
  });
};

const genSearchStr = obj => {
  return Object.entries(obj)
    .reduce((pre, [name, value]) => {
      return pre + `&${name}=${encodeURIComponent(value)}`;
    }, "")
    .slice(1);
};

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

export const cookie = {
  set(name, value, expires = null, path = "/", domain = null, secure = false) {
    var exp = new Date();
    expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : "";
    document.cookie
      = name
      + "="
      + escape(value)
      + (expires ? ";expires=" + exp.toGMTString() : "")
      + (path ? ";path=" + path : "")
      + (domain ? ";domain=" + domain : "")
      + (secure ? ";secure" : "");
  },
  get(name) {
    let reg = new RegExp("(^| )" + name + "(?:=([^;]*))?(;|$)"),
      val = document.cookie.match(reg);
    return val ? (val[2] ? unescape(val[2]) : "") : null;
  },
  del(name, { path = "/", domain, secure } = {}) {
    if (this.get(name) != null) {
      this.set(name, "", -1000, path, domain, secure);
    }
  },
  remove(key) {
    const oDel = options => {
      this.del(key, options);
      return !this.get(key);
    };

    let location = window.location,
      hostname = location.hostname,
      pathname = location.pathname,
      hostNames = hostname.split("."),
      pathNames = pathname.split("/"),
      domain = "",
      pathLen = pathNames.length,
      path;

    if (oDel()) {
      return;
    }

    for (var i = hostNames.length - 1; i >= 0; i--) {
      const hostName = hostNames[i];
      if (hostName === "") {
        continue;
      }
      domain = domain === "" ? hostName : hostName + "." + domain;

      path = "/";
      if (oDel({ domain: domain, path: path }) || oDel({ domain: domain })) {
        return;
      }

      for (let j = 0; j < pathLen; j++) {
        const pathName = pathNames[j];
        if (pathName === "") {
          continue;
        }

        path += pathName;
        if (oDel({ domain: domain, path: path }) || oDel({ path: path })) {
          return;
        }

        path += "/";
        if (oDel({ domain: domain, path: path }) || oDel({ path: path })) {
          return;
        }
      }
    }
  }
};
export const getSupportLink = async ({ baseUrl, openId, token, timer }) => {
  const res = await fetchFn({
    url: baseUrl + "/cnc/getSupportParams",
    param: {
      openId,
      token,
      timer
    },
    methods: "get"
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
